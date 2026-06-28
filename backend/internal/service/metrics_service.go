package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"slices"
	"sync"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/cache"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/storage"
	"github.com/google/uuid"
	"github.com/jung-kurt/gofpdf/v2"
	"google.golang.org/genai"
)

type MetricsService interface {
	GetDashboardMetrics(
		ctx context.Context,
		userID uuid.UUID,
		permissions []string,
	) (*models.DashboardMetrics, error)
	GenerateReportPDF(
		ctx context.Context,
		userID uuid.UUID,
		permissions []string,
	) ([]byte, error)
	GetClientMetrics(
		ctx context.Context,
		permissions []string,
		userID uuid.UUID,
	) ([]models.MetricCard, error)
	GetRoleMetrics(
		ctx context.Context,
	) ([]models.MetricCard, error)
	GetUserMetrics(
		ctx context.Context,
		permissions []string,
		userID uuid.UUID,
	) ([]models.MetricCard, error)
	GetLogMetrics(
		ctx context.Context,
		permissions []string,
	) ([]models.MetricCard, error)
	GetPermissionMetrics(
		ctx context.Context,
	) ([]models.MetricCard, error)
	GetRegistrationMetrics(
		ctx context.Context,
		permissions []string,
		userID uuid.UUID,
	) ([]models.MetricCard, error)
}

type metricsService struct {
	repo       repository.MetricsRepository
	cache      cache.Cache
	storage    *storage.S3Provider
	apiKey     string
	mu         sync.RWMutex
	lastResult models.SecurityAnalysisResult
}

func NewMetricsService(
	repo repository.MetricsRepository,
	c cache.Cache,
	s3 *storage.S3Provider,
) MetricsService {
	apiKey := os.Getenv("GEMINI_API_KEY")
	s := &metricsService{
		repo:    repo,
		cache:   c,
		storage: s3,
		apiKey:  apiKey,
		lastResult: models.SecurityAnalysisResult{
			ThreatLevel: "UNKNOWN",
			Confidence:  0.0,
			Anomalies:   []string{"Analysis has not run yet"},
			Advisory:    "Background analyzer is starting up.",
			AnalyzedAt:  time.Now(),
		},
	}

	go s.runBackgroundAnalyzer(context.Background())
	return s
}

func (s *metricsService) runBackgroundAnalyzer(ctx context.Context) {
	ticker := time.NewTicker(15 * time.Minute)
	defer ticker.Stop()

	// Initial run
	s.performAnalysis(ctx)

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			s.performAnalysis(ctx)
		}
	}
}

func (s *metricsService) performAnalysis(ctx context.Context) {
	if s.apiKey == "" {
		s.mu.Lock()
		s.lastResult = models.SecurityAnalysisResult{
			ThreatLevel: "UNKNOWN",
			Confidence:  0.0,
			Anomalies:   []string{"Gemini API Key is not configured"},
			Advisory:    "Please set GEMINI_API_KEY in the environment config.",
			AnalyzedAt:  time.Now(),
		}
		s.mu.Unlock()
		return
	}

	// Check Redis cache first to avoid rate limiting
	cacheKey := "metrics:security_analysis"
	cachedVal, ok, err := s.cache.Get(ctx, cacheKey)
	if err != nil {
		log.Printf("[MetricsService] Cache Get error: %v", err)
	} else if ok {
		var cachedResult models.SecurityAnalysisResult
		err := json.Unmarshal([]byte(cachedVal), &cachedResult)
		if err == nil {
			s.mu.Lock()
			s.lastResult = cachedResult
			s.mu.Unlock()
			return
		} else {
			log.Printf(
				"[MetricsService] Cache Unmarshal error: %v",
				err,
			)
		}
	}

	since := time.Now().Add(-1 * time.Hour)
	successCount, err := s.repo.GetTotalLogins(ctx, since, nil)
	if err != nil {
		log.Printf("[MetricsService] GetTotalLogins error: %v", err)
		return
	}

	failedAttempts, err := s.repo.GetFailedAuthAttempts(ctx, since, nil)
	if err != nil {
		log.Printf("[MetricsService] GetFailedAuthAttempts error: %v", err)
		return
	}

	topClients, err := s.repo.GetTopClients(ctx, 5, since, nil)
	if err != nil {
		log.Printf("[MetricsService] GetTopClients error: %v", err)
		return
	}

	failCount := 0
	for _, a := range failedAttempts {
		failCount += a.FailCount
	}

	topClientsJSON, _ := json.Marshal(topClients)
	attemptsJSON, _ := json.Marshal(failedAttempts)

	result, err := s.callGeminiAPI(
		ctx, successCount, failCount,
		string(topClientsJSON), string(attemptsJSON),
	)
	if err != nil {
		log.Printf("[MetricsService] callGeminiAPI error: %v", err)
		return
	}

	result.AnalyzedAt = time.Now()

	s.mu.Lock()
	s.lastResult = result
	s.mu.Unlock()

	resultJSON, err := json.Marshal(result)
	if err != nil {
		log.Printf("[MetricsService] Marshal result error: %v", err)
	} else {
		err = s.cache.Set(
			ctx, cacheKey, string(resultJSON), 2*time.Hour,
		)
		if err != nil {
			log.Printf("[MetricsService] Cache Set error: %v", err)
		}
	}
}

func (s *metricsService) callGeminiAPI(
	ctx context.Context, success int, fail int,
	topClients string, attempts string,
) (models.SecurityAnalysisResult, error) {
	log.Printf(
		"[MetricsService] Sending request to Gemini API "+
			"(success=%d, fail=%d)",
		success, fail,
	)

	config := &genai.ClientConfig{
		APIKey: s.apiKey,
	}
	baseURL := os.Getenv("GEMINI_BASE_URL")
	if baseURL != "" {
		config.HTTPOptions = genai.HTTPOptions{
			BaseURL: baseURL,
		}
	}

	client, err := genai.NewClient(ctx, config)
	if err != nil {
		return models.SecurityAnalysisResult{},
			fmt.Errorf("failed to create genai client: %w", err)
	}

	prompt := fmt.Sprintf(
		"Analyze authentication metrics for threats like brute force or DDoS.\n"+
			"Success Logins: %d\nFailed Logins: %d\n"+
			"Top Clients: %s\nFailed Attempts: %s",
		success, fail, topClients, attempts,
	)

	configObj := &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
		ResponseSchema: &genai.Schema{
			Type: genai.TypeObject,
			Properties: map[string]*genai.Schema{
				"threat_level": {
					Type: genai.TypeString,
					Enum: []string{"LOW", "MEDIUM", "HIGH"},
				},
				"confidence": {Type: genai.TypeNumber},
				"anomalies": {
					Type:  genai.TypeArray,
					Items: &genai.Schema{Type: genai.TypeString},
				},
				"advisory": {Type: genai.TypeString},
			},
			Required: []string{
				"threat_level", "confidence", "anomalies", "advisory",
			},
		},
	}

	resp, err := client.Models.GenerateContent(
		ctx,
		"gemini-3.1-flash-lite",
		genai.Text(prompt),
		configObj,
	)
	if err != nil {
		return models.SecurityAnalysisResult{},
			fmt.Errorf("gemini sdk request failed: %w", err)
	}

	text := resp.Text()
	var result models.SecurityAnalysisResult
	if err := json.Unmarshal([]byte(text), &result); err != nil {
		log.Printf(
			"[MetricsService] Failed to parse Gemini response: %v, raw: %s",
			err, text,
		)
		return models.SecurityAnalysisResult{},
			fmt.Errorf("failed to parse gemini response JSON: %w (raw: %s)",
				err, text)
	}

	log.Printf(
		"[MetricsService] Gemini API response parsed successfully: "+
			"level=%s, confidence=%.2f",
		result.ThreatLevel, result.Confidence,
	)

	return result, nil
}

func (s *metricsService) GetDashboardMetrics(
	ctx context.Context,
	userID uuid.UUID,
	permissions []string,
) (*models.DashboardMetrics, error) {
	now := time.Now()

	// Today start
	todayStart := time.Date(
		now.Year(), now.Month(), now.Day(),
		0, 0, 0, 0, now.Location(),
	)

	// This week start (Monday)
	daysSinceMonday := int(now.Weekday()) - 1
	if daysSinceMonday < 0 {
		daysSinceMonday = 6
	}
	weekStart := todayStart.AddDate(0, 0, -daysSinceMonday)

	// This month start
	monthStart := time.Date(
		now.Year(), now.Month(), 1,
		0, 0, 0, 0, now.Location(),
	)

	var allowedClients []string
	var err error
	if !slices.Contains(permissions, "View all appclients") {
		allowedClients, err = s.repo.GetBoundClientIDs(ctx, userID[:])
		if err != nil {
			log.Printf(
				"[MetricsService] GetBoundClientIDs error: %v",
				err,
			)
			return nil, fmt.Errorf(
				"failed to get bound client IDs: %w",
				err,
			)
		}
		if allowedClients == nil {
			allowedClients = []string{}
		}
	}

	todayCount, err := s.repo.GetTotalLogins(ctx, todayStart, allowedClients)
	if err != nil {
		log.Printf("[MetricsService] GetTotalLogins error: %v", err)
		return nil, err
	}

	weekCount, err := s.repo.GetTotalLogins(ctx, weekStart, allowedClients)
	if err != nil {
		log.Printf("[MetricsService] GetTotalLogins error: %v", err)
		return nil, err
	}

	monthCount, err := s.repo.GetTotalLogins(ctx, monthStart, allowedClients)
	if err != nil {
		log.Printf("[MetricsService] GetTotalLogins error: %v", err)
		return nil, err
	}

	todayTopClients, err := s.repo.GetTopClients(
		ctx, 5, todayStart, allowedClients,
	)
	if err != nil {
		log.Printf("[MetricsService] GetTopClients error: %v", err)
		return nil, err
	}

	weekTopClients, err := s.repo.GetTopClients(
		ctx, 5, weekStart, allowedClients,
	)
	if err != nil {
		log.Printf("[MetricsService] GetTopClients error: %v", err)
		return nil, err
	}

	monthTopClients, err := s.repo.GetTopClients(
		ctx, 5, monthStart, allowedClients,
	)
	if err != nil {
		log.Printf("[MetricsService] GetTopClients error: %v", err)
		return nil, err
	}

	todayTopClients = s.populateClientImageURLs(ctx, todayTopClients)
	weekTopClients = s.populateClientImageURLs(ctx, weekTopClients)
	monthTopClients = s.populateClientImageURLs(ctx, monthTopClients)

	s.mu.RLock()
	analysis := s.lastResult
	s.mu.RUnlock()

	// If cache has a newer result, use it
	cachedVal, ok, err := s.cache.Get(ctx, "metrics:security_analysis")
	if err != nil {
		log.Printf("[MetricsService] Cache Get error: %v", err)
	} else if ok {
		var cachedResult models.SecurityAnalysisResult
		err := json.Unmarshal([]byte(cachedVal), &cachedResult)
		if err == nil {
			analysis = cachedResult
		} else {
			log.Printf(
				"[MetricsService] Cache Unmarshal error: %v",
				err,
			)
		}
	}

	return &models.DashboardMetrics{
		LoginStats: models.LoginStats{
			Today: models.TimeframeStats{
				Count:      todayCount,
				TopClients: todayTopClients,
			},
			ThisWeek: models.TimeframeStats{
				Count:      weekCount,
				TopClients: weekTopClients,
			},
			ThisMonth: models.TimeframeStats{
				Count:      monthCount,
				TopClients: monthTopClients,
			},
		},
		SecurityAnalysis: analysis,
	}, nil
}

func (s *metricsService) populateClientImageURLs(ctx context.Context,
	clients []models.TopClientLogin,
) []models.TopClientLogin {
	for i := range clients {
		if clients[i].ImageLocation != "" {
			url, err := GetPresignedURL(
				ctx, clients[i].ImageLocation, s.storage,
			)
			if err != nil {
				log.Printf(
					"[MetricsService] GetPresignedURL error: %v",
					err,
				)
			} else {
				clients[i].ImageURL = url
			}
		}
	}
	return clients
}

func addReportHeader(pdf *gofpdf.Fpdf, generatedAt string) {
	pdf.SetXY(15, 18)
	pdf.SetTextColor(20, 20, 20)
	pdf.SetFont("Arial", "B", 17)
	pdf.Cell(0, 8, "Identity Provider Metrics & Security Report")

	pdf.SetXY(15, 27)
	pdf.SetFont("Arial", "I", 10)
	pdf.SetTextColor(45, 45, 45)
	pdf.Cell(0, 6, fmt.Sprintf("Generated on: %s", generatedAt))
	pdf.Ln(22)
}

func addReportSectionTitle(pdf *gofpdf.Fpdf, title string) {
	pdf.SetTextColor(20, 20, 20)
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(0, 9, title)
	pdf.Ln(11)
}

func addReportTableHeader(pdf *gofpdf.Fpdf, headers []string, widths []float64) {
	pdf.SetFillColor(244, 244, 244)
	pdf.SetDrawColor(185, 185, 185)
	pdf.SetTextColor(20, 20, 20)
	pdf.SetFont("Arial", "B", 9)

	for i, header := range headers {
		pdf.CellFormat(widths[i], 9, header, "1", 0, "C", true, 0, "")
	}
	pdf.Ln(-1)
}

func addReportCell(
	pdf *gofpdf.Fpdf,
	width float64,
	height float64,
	text string,
	align string,
	bold bool,
) {
	if bold {
		pdf.SetFont("Arial", "B", 9)
	} else {
		pdf.SetFont("Arial", "", 9)
	}
	pdf.CellFormat(width, height, text, "1", 0, align, false, 0, "")
}

func addWrappedReportRow(
	pdf *gofpdf.Fpdf,
	labelWidth float64,
	valueWidth float64,
	minHeight float64,
	label string,
	value string,
	valueBold bool,
) {
	x := pdf.GetX()
	y := pdf.GetY()
	lineHeight := 5.0
	paddingX := 1.5
	paddingY := 2.0

	pdf.SetFont("Arial", "", 9)
	valueLines := pdf.SplitLines([]byte(value), valueWidth-(paddingX*2))
	rowHeight := minHeight
	requiredHeight := float64(len(valueLines))*lineHeight + (paddingY * 2)
	if requiredHeight > rowHeight {
		rowHeight = requiredHeight
	}

	pdf.Rect(x, y, labelWidth, rowHeight, "")
	pdf.Rect(x+labelWidth, y, valueWidth, rowHeight, "")

	pdf.SetXY(x+paddingX, y+paddingY)
	pdf.SetFont("Arial", "B", 9)
	pdf.MultiCell(labelWidth-(paddingX*2), lineHeight, label, "", "L", false)

	pdf.SetXY(x+labelWidth+paddingX, y+paddingY)
	if valueBold {
		pdf.SetFont("Arial", "B", 9)
	} else {
		pdf.SetFont("Arial", "", 9)
	}
	pdf.MultiCell(valueWidth-(paddingX*2), lineHeight, value, "", "L", false)

	pdf.SetXY(x, y+rowHeight)
}

func addReportSecurityTable(
	pdf *gofpdf.Fpdf,
	analysis models.SecurityAnalysisResult,
) {
	labelWidth := 52.0
	valueWidth := 128.0
	rowHeight := 13.0
	analyzedDate := analysis.AnalyzedAt.Format("2006-01-02 15:04:05 MST")

	rows := []struct {
		label string
		value string
		bold  bool
	}{
		{"Threat Level:", analysis.ThreatLevel, true},
		{"Confidence Score:", fmt.Sprintf("%.2f", analysis.Confidence), false},
		{"Analysis Date:", analyzedDate, false},
		{"Security Advisory:", analysis.Advisory, false},
	}

	pdf.SetDrawColor(185, 185, 185)
	pdf.SetTextColor(20, 20, 20)
	for _, row := range rows {
		addWrappedReportRow(
			pdf,
			labelWidth,
			valueWidth,
			rowHeight,
			row.label,
			row.value,
			row.bold,
		)
	}
	pdf.Ln(16)
}

func addReportAuthStatsTable(
	pdf *gofpdf.Fpdf,
	stats models.LoginStats,
) {
	widths := []float64{58, 84, 38}
	addReportTableHeader(pdf, []string{"TIME PERIOD", "CLIENT", "LOGINS"}, widths)

	periodRows := []struct {
		label   string
		count   int
		clients []models.TopClientLogin
	}{
		{"Today - Total Logins", stats.Today.Count, stats.Today.TopClients},
		{"This Week - Total Logins", stats.ThisWeek.Count, stats.ThisWeek.TopClients},
		{"This Month - Total Logins", stats.ThisMonth.Count, stats.ThisMonth.TopClients},
	}

	pdf.SetDrawColor(185, 185, 185)
	pdf.SetTextColor(20, 20, 20)
	for _, period := range periodRows {
		if len(period.clients) == 0 {
			addReportCell(pdf, widths[0], 12, fmt.Sprintf("%s: %d", period.label, period.count), "L", true)
			addReportCell(pdf, widths[1], 12, "No client login activity", "L", false)
			addReportCell(pdf, widths[2], 12, "0", "C", false)
			pdf.Ln(-1)
			continue
		}

		for index, client := range period.clients {
			periodLabel := ""
			if index == 0 {
				periodLabel = fmt.Sprintf("%s: %d", period.label, period.count)
			}

			addReportCell(pdf, widths[0], 12, periodLabel, "L", index == 0)
			addReportCell(pdf, widths[1], 12, client.ClientName, "L", false)
			addReportCell(pdf, widths[2], 12, fmt.Sprintf("%d", client.LoginCount), "C", false)
			pdf.Ln(-1)
		}
	}
	pdf.Ln(16)
}

func truncateReportText(value string, maxLength int) string {
	if len(value) <= maxLength {
		return value
	}
	return value[:maxLength-3] + "..."
}

func addReportFailedAttemptsTable(
	pdf *gofpdf.Fpdf,
	failedAttempts []models.FailedAuthAttempt,
) {
	widths := []float64{38, 78, 35, 29}
	addReportTableHeader(
		pdf,
		[]string{"IP ADDRESS", "ACTOR (USERNAME/EMAIL)", "FAIL COUNT", "LAST ATTEMPT"},
		widths,
	)

	pdf.SetDrawColor(185, 185, 185)
	pdf.SetTextColor(20, 20, 20)

	if len(failedAttempts) == 0 {
		addReportCell(pdf, widths[0], 12, "None", "C", false)
		addReportCell(pdf, widths[1], 12, "No failed attempts recorded", "C", false)
		addReportCell(pdf, widths[2], 12, "0", "C", false)
		addReportCell(pdf, widths[3], 12, "-", "C", false)
		pdf.Ln(-1)
		return
	}

	for _, attempt := range failedAttempts {
		addReportCell(pdf, widths[0], 12, attempt.IP, "C", false)
		addReportCell(pdf, widths[1], 12, truncateReportText(attempt.Actor, 42), "C", false)
		addReportCell(pdf, widths[2], 12, fmt.Sprintf("%d", attempt.FailCount), "C", false)
		addReportCell(pdf, widths[3], 12, attempt.LastAttempt.Format("15:04:05"), "C", false)
		pdf.Ln(-1)
	}
}

func (s *metricsService) GenerateReportPDF(
	ctx context.Context,
	userID uuid.UUID,
	permissions []string,
) ([]byte, error) {
	metrics, err := s.GetDashboardMetrics(ctx, userID, permissions)
	if err != nil {
		log.Printf(
			"[MetricsService] GetDashboardMetrics error: %v",
			err,
		)
		return nil, fmt.Errorf("failed to get dashboard metrics: %w", err)
	}

	var allowedClients []string
	var err2 error
	if !slices.Contains(permissions, "View all appclients") {
		allowedClients, err2 = s.repo.GetBoundClientIDs(ctx, userID[:])
		if err2 != nil {
			log.Printf(
				"[MetricsService] GetBoundClientIDs error: %v",
				err2,
			)
			return nil, fmt.Errorf(
				"failed to get bound client IDs: %w",
				err2,
			)
		}
		if allowedClients == nil {
			allowedClients = []string{}
		}
	}

	since := time.Now().Add(-24 * time.Hour)
	failedAttempts, err := s.repo.GetFailedAuthAttempts(
		ctx, since, allowedClients,
	)
	if err != nil {
		log.Printf(
			"[MetricsService] GetFailedAuthAttempts error: %v",
			err,
		)
		return nil, fmt.Errorf("failed to get failed auth attempts: %w", err)
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 18, 15)
	pdf.SetAutoPageBreak(true, 28)

	pdf.SetFooterFunc(func() {
		pdf.SetY(-27)
		pdf.SetFont("Arial", "", 8)
		pdf.SetTextColor(25, 25, 25)
		pdf.SetX(105)
		pdf.CellFormat(
			90, 5,
			"This is system-generated, signature is not required.",
			"", 0, "R", false, 0, "",
		)

		pdf.SetY(-21)
		pdf.SetDrawColor(30, 30, 30)
		pdf.Line(15, pdf.GetY(), 195, pdf.GetY())

		pdf.SetY(-16)
		pdf.SetFont("Arial", "B", 8)
		pdf.SetTextColor(180, 0, 0)
		pdf.SetX(5)
		pdf.CellFormat(
			145, 4,
			"This document contains personal-identifiable information that is subject to Data Privacy.",
			"", 0, "C", false, 0, "",
		)

		pdf.SetY(-11)
		pdf.SetX(5)
		pdf.CellFormat(
			145, 4,
			"Please keep this document protected and in a safe place.",
			"", 0, "C", false, 0, "",
		)
	})

	pdf.AddPage()

	genDate := time.Now().Format("2006-01-02 15:04:05 MST")
	addReportHeader(pdf, genDate)

	addReportSectionTitle(pdf, "1. Executive Security Analysis")
	addReportSecurityTable(pdf, metrics.SecurityAnalysis)

	addReportSectionTitle(pdf, "2. Authentication Statistics")
	addReportAuthStatsTable(pdf, metrics.LoginStats)

	addReportSectionTitle(pdf, "3. Failed Authentication Attempts (Last 24 Hours)")
	addReportFailedAttemptsTable(pdf, failedAttempts)

	var buf bytes.Buffer
	err = pdf.Output(&buf)
	if err != nil {
		log.Printf("[MetricsService] PDF Output error: %v", err)
		return nil, fmt.Errorf("failed to generate PDF output: %w", err)
	}

	return buf.Bytes(), nil
}

func (s *metricsService) GetClientMetrics(
	ctx context.Context,
	permissions []string,
	userID uuid.UUID,
) ([]models.MetricCard, error) {
	var allowedClients []string
	var err error
	if !slices.Contains(permissions, "View all appclients") {
		allowedClients, err = s.repo.GetBoundClientIDs(ctx, userID[:])
		if err != nil {
			log.Printf(
				"[MetricsService] GetBoundClientIDs error: %v",
				err,
			)
			return nil, fmt.Errorf(
				"failed to get bound client IDs: %w",
				err,
			)
		}
		if allowedClients == nil {
			allowedClients = []string{}
		}
	}
	return s.repo.GetClientMetrics(ctx, allowedClients)
}

func (s *metricsService) GetRoleMetrics(
	ctx context.Context,
) ([]models.MetricCard, error) {
	return s.repo.GetRoleMetrics(ctx)
}

func (s *metricsService) GetUserMetrics(
	ctx context.Context,
	permissions []string,
	userID uuid.UUID,
) ([]models.MetricCard, error) {
	var adminID []byte
	if !slices.Contains(permissions, "View all users") {
		adminID = userID[:]
	}
	return s.repo.GetUserMetrics(ctx, adminID)
}

func (s *metricsService) GetLogMetrics(
	ctx context.Context,
	permissions []string,
) ([]models.MetricCard, error) {
	hasAudit := slices.Contains(permissions, "View audit logs")
	hasSecurity := slices.Contains(permissions, "View security logs")
	return s.repo.GetLogMetrics(ctx, hasAudit, hasSecurity)
}

func (s *metricsService) GetPermissionMetrics(
	ctx context.Context,
) ([]models.MetricCard, error) {
	return s.repo.GetPermissionMetrics(ctx)
}

func (s *metricsService) GetRegistrationMetrics(
	ctx context.Context,
	permissions []string,
	userID uuid.UUID,
) ([]models.MetricCard, error) {
	var allowedClients []string
	var err error
	if !slices.Contains(permissions, "View all appclients") {
		allowedClients, err = s.repo.GetBoundClientIDs(ctx, userID[:])
		if err != nil {
			log.Printf(
				"[MetricsService] GetBoundClientIDs error: %v",
				err,
			)
			return nil, fmt.Errorf(
				"failed to get bound client IDs: %w",
				err,
			)
		}
		if allowedClients == nil {
			allowedClients = []string{}
		}
	}
	return s.repo.GetRegistrationMetrics(ctx, allowedClients)
}
