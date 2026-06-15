package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
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
}

type metricsService struct {
	repo       repository.MetricsRepository
	cache      cache.Cache
	storage    *storage.S3Provider
	apiKey     string
	mu         sync.RWMutex
	lastResult models.SecurityAnalysisResult
}

type geminiRequest struct {
	Contents         []geminiContent `json:"contents"`
	GenerationConfig geminiConfig    `json:"generationConfig"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text string `json:"text"`
}

type geminiConfig struct {
	ResponseMIMEType string        `json:"responseMimeType"`
	ResponseSchema   *geminiSchema `json:"responseSchema,omitempty"`
}

type geminiSchema struct {
	Type       string                   `json:"type"`
	Properties map[string]*geminiSchema `json:"properties,omitempty"`
	Required   []string                 `json:"required,omitempty"`
	Items      *geminiSchema            `json:"items,omitempty"`
	Enum       []string                 `json:"enum,omitempty"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
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
	if cachedVal, ok, err := s.cache.Get(ctx, cacheKey); err == nil && ok {
		var cachedResult models.SecurityAnalysisResult
		if err := json.Unmarshal([]byte(cachedVal), &cachedResult); err == nil {
			s.mu.Lock()
			s.lastResult = cachedResult
			s.mu.Unlock()
			return
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

	resultJSON, _ := json.Marshal(result)
	_ = s.cache.Set(ctx, cacheKey, string(resultJSON), 30*time.Minute)
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

	baseURL := os.Getenv("GEMINI_BASE_URL")
	if baseURL == "" {
		baseURL = "https://generativelanguage.googleapis.com"
	}
	url := fmt.Sprintf(
		"%s/v1/models/gemini-3.5-flash:generateContent",
		baseURL,
	)

	prompt := fmt.Sprintf(
		"Analyze authentication metrics for threats like brute force or DDoS.\n"+
			"Success Logins: %d\nFailed Logins: %d\n"+
			"Top Clients: %s\nFailed Attempts: %s",
		success, fail, topClients, attempts,
	)

	reqPayload := geminiRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{Text: prompt},
				},
			},
		},
		GenerationConfig: geminiConfig{
			ResponseMIMEType: "application/json",
			ResponseSchema: &geminiSchema{
				Type: "OBJECT",
				Properties: map[string]*geminiSchema{
					"threat_level": {
						Type: "STRING",
						Enum: []string{"LOW", "MEDIUM", "HIGH"},
					},
					"confidence": {Type: "NUMBER"},
					"anomalies": {
						Type:  "ARRAY",
						Items: &geminiSchema{Type: "STRING"},
					},
					"advisory": {Type: "STRING"},
				},
				Required: []string{
					"threat_level", "confidence", "anomalies", "advisory",
				},
			},
		},
	}

	bodyBytes, err := json.Marshal(reqPayload)
	if err != nil {
		return models.SecurityAnalysisResult{}, err
	}

	req, err := http.NewRequestWithContext(
		ctx, "POST", url, bytes.NewReader(bodyBytes),
	)
	if err != nil {
		return models.SecurityAnalysisResult{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-goog-api-key", s.apiKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return models.SecurityAnalysisResult{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		log.Printf(
			"[MetricsService] Gemini API returned status %d: %v",
			resp.StatusCode, errResp,
		)
		return models.SecurityAnalysisResult{}, fmt.Errorf(
			"gemini api returned status %d: %v", resp.StatusCode, errResp)
	}

	var geminiResp geminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return models.SecurityAnalysisResult{}, err
	}

	if len(geminiResp.Candidates) == 0 ||
		len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return models.SecurityAnalysisResult{}, fmt.Errorf(
			"empty gemini response candidates")
	}

	responseText := geminiResp.Candidates[0].Content.Parts[0].Text

	var result models.SecurityAnalysisResult
	if err := json.Unmarshal([]byte(responseText), &result); err != nil {
		log.Printf(
			"[MetricsService] Failed to parse Gemini response: %v, raw: %s",
			err, responseText,
		)
		return models.SecurityAnalysisResult{}, fmt.Errorf(
			"failed to parse gemini response JSON: %w (raw response: %s)",
			err, responseText)
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
			return nil, fmt.Errorf("failed to get bound client IDs: %w", err)
		}
		if allowedClients == nil {
			allowedClients = []string{}
		}
	}

	todayCount, err := s.repo.GetTotalLogins(ctx, todayStart, allowedClients)
	if err != nil {
		return nil, err
	}

	weekCount, err := s.repo.GetTotalLogins(ctx, weekStart, allowedClients)
	if err != nil {
		return nil, err
	}

	monthCount, err := s.repo.GetTotalLogins(ctx, monthStart, allowedClients)
	if err != nil {
		return nil, err
	}

	todayTopClients, err := s.repo.GetTopClients(
		ctx, 5, todayStart, allowedClients,
	)
	if err != nil {
		return nil, err
	}

	weekTopClients, err := s.repo.GetTopClients(
		ctx, 5, weekStart, allowedClients,
	)
	if err != nil {
		return nil, err
	}

	monthTopClients, err := s.repo.GetTopClients(
		ctx, 5, monthStart, allowedClients,
	)
	if err != nil {
		return nil, err
	}

	todayTopClients = s.populateClientImageURLs(ctx, todayTopClients)
	weekTopClients = s.populateClientImageURLs(ctx, weekTopClients)
	monthTopClients = s.populateClientImageURLs(ctx, monthTopClients)

	s.mu.RLock()
	analysis := s.lastResult
	s.mu.RUnlock()

	// If cache has a newer result, use it
	if cachedVal, ok, err := s.cache.Get(
		ctx, "metrics:security_analysis",
	); err == nil && ok {
		var cachedResult models.SecurityAnalysisResult
		if err := json.Unmarshal([]byte(cachedVal), &cachedResult); err == nil {
			analysis = cachedResult
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
			if err == nil {
				clients[i].ImageURL = url
			}
		}
	}
	return clients
}

func (s *metricsService) GenerateReportPDF(
	ctx context.Context,
	userID uuid.UUID,
	permissions []string,
) ([]byte, error) {
	metrics, err := s.GetDashboardMetrics(ctx, userID, permissions)
	if err != nil {
		return nil, fmt.Errorf("failed to get dashboard metrics: %w", err)
	}

	var allowedClients []string
	var err2 error
	if !slices.Contains(permissions, "View all appclients") {
		allowedClients, err2 = s.repo.GetBoundClientIDs(ctx, userID[:])
		if err2 != nil {
			return nil, fmt.Errorf("failed to get bound client IDs: %w", err2)
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
		return nil, fmt.Errorf("failed to get failed auth attempts: %w", err)
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 20, 15)

	pdf.SetFooterFunc(func() {
		pdf.SetY(-15)
		pdf.SetFont("Arial", "B", 8)
		pdf.SetTextColor(255, 0, 0)
		warningText := "This document contains personal-identifiable " +
			"information that is subject to Data Privacy. " +
			"Please keep this document protected and in a safe pace."
		pdf.CellFormat(
			0, 10,
			warningText,
			"", 0, "C", false, 0, "",
		)
	})

	pdf.AddPage()

	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(0, 10, "Identity Provider Metrics & Security Report")
	pdf.Ln(8)
	pdf.SetFont("Arial", "I", 10)
	genDate := time.Now().Format("2006-01-02 15:04:05 MST")
	pdf.Cell(0, 10, fmt.Sprintf("Generated on: %s", genDate))
	pdf.Ln(12)

	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 10, "1. Executive Security Analysis")
	pdf.Ln(8)
	pdf.SetFont("Arial", "", 10)

	pdf.Cell(40, 6, "Threat Level:")
	pdf.SetFont("Arial", "B", 10)
	pdf.Cell(0, 6, metrics.SecurityAnalysis.ThreatLevel)
	pdf.Ln(6)

	pdf.SetFont("Arial", "", 10)
	pdf.Cell(40, 6, "Confidence Score:")
	pdf.Cell(0, 6, fmt.Sprintf("%.2f", metrics.SecurityAnalysis.Confidence))
	pdf.Ln(6)

	pdf.Cell(40, 6, "Analysis Date:")
	analyzedDate := metrics.SecurityAnalysis.AnalyzedAt.Format(
		"2006-01-02 15:04:05 MST",
	)
	pdf.Cell(0, 6, analyzedDate)
	pdf.Ln(8)

	pdf.SetFont("Arial", "B", 10)
	pdf.Cell(0, 6, "Security Advisory:")
	pdf.Ln(6)
	pdf.SetFont("Arial", "", 10)
	pdf.MultiCell(0, 6, metrics.SecurityAnalysis.Advisory, "", "", false)
	pdf.Ln(8)

	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 10, "2. Authentication Statistics")
	pdf.Ln(8)

	pdf.SetFont("Arial", "B", 10)
	pdf.Cell(
		0, 6,
		fmt.Sprintf(
			"Today - Total Logins: %d",
			metrics.LoginStats.Today.Count,
		),
	)
	pdf.Ln(6)
	pdf.SetFont("Arial", "", 10)
	for _, tc := range metrics.LoginStats.Today.TopClients {
		pdf.Cell(10, 6, "")
		pdf.Cell(80, 6, fmt.Sprintf("Client: %s", tc.ClientName))
		pdf.Cell(0, 6, fmt.Sprintf("Logins: %d", tc.LoginCount))
		pdf.Ln(6)
	}

	pdf.SetFont("Arial", "B", 10)
	pdf.Cell(
		0, 6,
		fmt.Sprintf(
			"This Week - Total Logins: %d",
			metrics.LoginStats.ThisWeek.Count,
		),
	)
	pdf.Ln(6)
	pdf.SetFont("Arial", "", 10)
	for _, tc := range metrics.LoginStats.ThisWeek.TopClients {
		pdf.Cell(10, 6, "")
		pdf.Cell(80, 6, fmt.Sprintf("Client: %s", tc.ClientName))
		pdf.Cell(0, 6, fmt.Sprintf("Logins: %d", tc.LoginCount))
		pdf.Ln(6)
	}

	pdf.SetFont("Arial", "B", 10)
	pdf.Cell(
		0, 6,
		fmt.Sprintf(
			"This Month - Total Logins: %d",
			metrics.LoginStats.ThisMonth.Count,
		),
	)
	pdf.Ln(6)
	pdf.SetFont("Arial", "", 10)
	for _, tc := range metrics.LoginStats.ThisMonth.TopClients {
		pdf.Cell(10, 6, "")
		pdf.Cell(80, 6, fmt.Sprintf("Client: %s", tc.ClientName))
		pdf.Cell(0, 6, fmt.Sprintf("Logins: %d", tc.LoginCount))
		pdf.Ln(6)
	}
	pdf.Ln(8)

	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 10, "3. Failed Authentication Attempts (Last 24 Hours)")
	pdf.Ln(8)
	pdf.SetFont("Arial", "B", 10)

	pdf.Cell(50, 6, "IP Address")
	pdf.Cell(80, 6, "Actor (Username/Email)")
	pdf.Cell(20, 6, "Fail Count")
	pdf.Cell(30, 6, "Last Attempt")
	pdf.Ln(6)

	pdf.SetFont("Arial", "", 10)
	for _, fa := range failedAttempts {
		actor := fa.Actor
		if len(actor) > 40 {
			actor = actor[:37] + "..."
		}
		pdf.Cell(50, 6, fa.IP)
		pdf.Cell(80, 6, actor)
		pdf.Cell(20, 6, fmt.Sprintf("%d", fa.FailCount))
		pdf.Cell(30, 6, fa.LastAttempt.Format("15:04:05"))
		pdf.Ln(6)
	}

	var buf bytes.Buffer
	err = pdf.Output(&buf)
	if err != nil {
		return nil, fmt.Errorf("failed to generate PDF output: %w", err)
	}

	return buf.Bytes(), nil
}
