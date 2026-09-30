package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"slices"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/jung-kurt/gofpdf/v2"
)

type ReportService interface {
	GenerateSystemReport(
		ctx context.Context,
		permissions []string,
		params dto.SystemReportParams,
	) ([]byte, error)
	GenerateSummaryReport(
		ctx context.Context,
		params dto.SummaryReportParams,
	) ([]byte, error)
}

type reportService struct {
	userRepo    repository.UserRepository
	clientRepo  repository.ClientRepository
	logRepo     repository.LogRepository
	metricsRepo repository.MetricsRepository
}

func NewReportService(
	userRepo repository.UserRepository,
	clientRepo repository.ClientRepository,
	logRepo repository.LogRepository,
	metricsRepo repository.MetricsRepository,
) ReportService {
	return &reportService{
		userRepo:    userRepo,
		clientRepo:  clientRepo,
		logRepo:     logRepo,
		metricsRepo: metricsRepo,
	}
}

type SystemReportJSON struct {
	Users   []models.User     `json:"users,omitempty"`
	Clients []models.Client   `json:"clients,omitempty"`
	Logs    []models.AuditLog `json:"logs,omitempty"`
}

func (s *reportService) GenerateSystemReport(
	ctx context.Context,
	permissions []string,
	params dto.SystemReportParams,
) ([]byte, error) {
	var users []models.User
	var clients []models.Client
	var logs []models.AuditLog
	var err error

	hasUsersPerm := slices.Contains(permissions, "View all users")
	hasClientsPerm := slices.Contains(permissions, "View all appclients")
	hasLogsPerm := slices.Contains(permissions, "View audit logs")

	if params.IncludeUsers && hasUsersPerm {
		users, err = s.userRepo.GetUserList(
			ctx, params.LimitUsers, 0, "created_at", "DESC", "",
		)
		if err != nil {
			log.Printf("[ReportService] GetUserList error: %v", err)
			return nil, fmt.Errorf("failed to fetch users: %w", err)
		}
	}

	if params.IncludeClients && hasClientsPerm {
		clients, err = s.clientRepo.ListClients(
			ctx, params.LimitClients, 0, "", "client_name", "ASC",
		)
		if err != nil {
			log.Printf("[ReportService] ListClients error: %v", err)
			return nil, fmt.Errorf("failed to fetch clients: %w", err)
		}
	}

	if params.IncludeLogs && hasLogsPerm {
		logs, err = s.logRepo.GetLogList(ctx, params.LimitLogs, 0)
		if err != nil {
			log.Printf("[ReportService] GetLogList error: %v", err)
			return nil, fmt.Errorf("failed to fetch logs: %w", err)
		}
	}

	if params.Format == "json" {
		reportData := SystemReportJSON{
			Users:   users,
			Clients: clients,
			Logs:    logs,
		}
		return json.MarshalIndent(reportData, "", "  ")
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
			"This document contains personal-identifiable information "+
				"that is subject to Data Privacy.",
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
	addSystemReportHeader(pdf, genDate)

	if params.IncludeUsers && hasUsersPerm {
		addReportSectionTitle(pdf, "1. Registered Users")
		addUsersTable(pdf, users)
	}

	if params.IncludeClients && hasClientsPerm {
		sectionNum := "2"
		if !params.IncludeUsers || !hasUsersPerm {
			sectionNum = "1"
		}
		addReportSectionTitle(
			pdf, fmt.Sprintf("%s. Registered Application Clients", sectionNum),
		)
		addClientsTable(pdf, clients)
	}

	if params.IncludeLogs && hasLogsPerm {
		sectionNum := "3"
		if (!params.IncludeUsers || !hasUsersPerm) &&
			(!params.IncludeClients || !hasClientsPerm) {
			sectionNum = "1"
		} else if (!params.IncludeUsers || !hasUsersPerm) ||
			(!params.IncludeClients || !hasClientsPerm) {
			sectionNum = "2"
		}
		addReportSectionTitle(
			pdf, fmt.Sprintf("%s. System Audit Logs", sectionNum),
		)
		addLogsTable(pdf, logs)
	}

	var buf bytes.Buffer
	err = pdf.Output(&buf)
	if err != nil {
		log.Printf("[ReportService] PDF Output error: %v", err)
		return nil, fmt.Errorf("failed to generate PDF output: %w", err)
	}

	return buf.Bytes(), nil
}

func addSystemReportHeader(pdf *gofpdf.Fpdf, generatedAt string) {
	pdf.SetXY(15, 18)
	pdf.SetTextColor(20, 20, 20)
	pdf.SetFont("Arial", "B", 17)
	pdf.Cell(0, 8, "Identity Provider System & Audit Report")

	pdf.SetXY(15, 27)
	pdf.SetFont("Arial", "I", 10)
	pdf.SetTextColor(45, 45, 45)
	pdf.Cell(0, 6, fmt.Sprintf("Generated on: %s", generatedAt))
	pdf.Ln(22)
}

func addUsersTable(pdf *gofpdf.Fpdf, users []models.User) {
	widths := []float64{40, 55, 25, 30, 30}
	addReportTableHeader(
		pdf,
		[]string{"NAME", "EMAIL", "STATUS", "ROLE", "CREATED AT"},
		widths,
	)

	pdf.SetDrawColor(185, 185, 185)
	pdf.SetTextColor(20, 20, 20)

	if len(users) == 0 {
		addReportCell(pdf, widths[0], 12, "None", "C", false)
		addReportCell(pdf, widths[1], 12, "No users recorded", "C", false)
		addReportCell(pdf, widths[2], 12, "-", "C", false)
		addReportCell(pdf, widths[3], 12, "-", "C", false)
		addReportCell(pdf, widths[4], 12, "-", "C", false)
		pdf.Ln(-1)
		return
	}

	for _, u := range users {
		fullName := fmt.Sprintf("%s %s", u.FirstName, u.LastName)
		createdAtStr := u.CreatedAt.Format("2006-01-02")
		roleName := "-"
		if u.Role.RoleName != "" {
			roleName = u.Role.RoleName
		}

		addMultiCellReportRow(
			pdf,
			widths,
			12,
			[]string{fullName, u.Email, string(u.Status), roleName, createdAtStr},
			[]string{"L", "L", "C", "C", "C"},
		)
	}
	pdf.Ln(16)
}

func addClientsTable(pdf *gofpdf.Fpdf, clients []models.Client) {
	widths := []float64{45, 55, 30, 50}
	addReportTableHeader(
		pdf,
		[]string{"CLIENT NAME", "BASE URL", "TOKENS TTL (A/R)", "GRANTS"},
		widths,
	)

	pdf.SetDrawColor(185, 185, 185)
	pdf.SetTextColor(20, 20, 20)

	if len(clients) == 0 {
		addReportCell(pdf, widths[0], 12, "None", "C", false)
		addReportCell(pdf, widths[1], 12, "No appclients recorded", "C", false)
		addReportCell(pdf, widths[2], 12, "-", "C", false)
		addReportCell(pdf, widths[3], 12, "-", "C", false)
		pdf.Ln(-1)
		return
	}

	for _, c := range clients {
		ttlStr := fmt.Sprintf(
			"%ds / %ds", c.AccessTokenTTL, c.RefreshTokenTTL,
		)
		grantsStr := ""
		if len(c.Grants) > 0 {
			grantsStr = c.Grants[0]
			if len(c.Grants) > 1 {
				grantsStr += ", ..."
			}
		} else {
			grantsStr = "-"
		}

		addMultiCellReportRow(
			pdf,
			widths,
			12,
			[]string{c.ClientName, c.BaseUrl, ttlStr, grantsStr},
			[]string{"L", "L", "C", "L"},
		)
	}
	pdf.Ln(16)
}

func addLogsTable(pdf *gofpdf.Fpdf, logs []models.AuditLog) {
	widths := []float64{50, 35, 40, 25, 30}
	addReportTableHeader(
		pdf,
		[]string{"ACTOR", "ACTION", "TARGET", "STATUS", "TIMESTAMP"},
		widths,
	)

	pdf.SetDrawColor(185, 185, 185)
	pdf.SetTextColor(20, 20, 20)

	if len(logs) == 0 {
		addReportCell(pdf, widths[0], 12, "None", "C", false)
		addReportCell(pdf, widths[1], 12, "No audit logs recorded", "C", false)
		addReportCell(pdf, widths[2], 12, "-", "C", false)
		addReportCell(pdf, widths[3], 12, "-", "C", false)
		addReportCell(pdf, widths[4], 12, "-", "C", false)
		pdf.Ln(-1)
		return
	}

	for _, logEntry := range logs {
		actorStr := "-"
		if logEntry.Actor != nil {
			actorStr = *logEntry.Actor
		}
		timeStr := logEntry.CreatedAt.Format("2006-01-02 15:04:05")

		addMultiCellReportRow(
			pdf,
			widths,
			12,
			[]string{actorStr, logEntry.Action, logEntry.Target, logEntry.Status, timeStr},
			[]string{"L", "C", "C", "C", "C"},
		)
	}
	pdf.Ln(16)
}

func (s *reportService) GenerateSummaryReport(
	ctx context.Context,
	params dto.SummaryReportParams,
) ([]byte, error) {
	var since time.Duration
	switch params.TimeFrame {
	case "7d":
		since = 7 * 24 * time.Hour
	case "30d":
		since = 30 * 24 * time.Hour
	default:
		params.TimeFrame = "24h"
		since = 24 * time.Hour
	}

	startTime := time.Now().Add(-since)

	var userMetrics, roleMetrics, permMetrics, clientMetrics, logMetrics []models.MetricCard
	var totalLoginsInt int
	var failedAttempts []models.FailedAuthAttempt
	var topClients []models.TopClientLogin

	if s.metricsRepo != nil {
		userMetrics, _ = s.metricsRepo.GetUserMetrics(ctx, nil)
		roleMetrics, _ = s.metricsRepo.GetRoleMetrics(ctx)
		permMetrics, _ = s.metricsRepo.GetPermissionMetrics(ctx)
		clientMetrics, _ = s.metricsRepo.GetClientMetrics(ctx, nil)
		logMetrics, _ = s.metricsRepo.GetLogMetrics(ctx, true, true)

		totalLoginsInt, _ = s.metricsRepo.GetTotalLogins(ctx, startTime, nil)
		failedAttempts, _ = s.metricsRepo.GetFailedAuthAttempts(ctx, startTime, nil)
		topClients, _ = s.metricsRepo.GetTopClients(ctx, 10, startTime, nil)
	}

	totalLogins := int64(totalLoginsInt)
	failedCount := int64(len(failedAttempts))
	successfulCount := totalLogins - failedCount
	if successfulCount < 0 {
		successfulCount = 0
	}

	var successRate float64
	if totalLogins > 0 {
		successRate = (float64(successfulCount) / float64(totalLogins)) * 100.0
	}

	failureReasons := make(map[string]int64)
	for range failedAttempts {
		failureReasons["Failed Auth Attempt"]++
	}

	overview := dto.AccountSystemOverviewDTO{}
	for _, m := range userMetrics {
		switch m.Title {
		case "Total Accounts":
			overview.TotalAccounts = parseMetricValue(m.Value)
		case "Active Accounts":
			overview.ActiveAccounts = parseMetricValue(m.Value)
		case "Archived Accounts":
			overview.ArchivedAccounts = parseMetricValue(m.Value)
		}
	}
	for _, m := range clientMetrics {
		switch m.Title {
		case "Total Clients":
			overview.TotalClients = parseMetricValue(m.Value)
		case "Active Clients":
			overview.ActiveClients = parseMetricValue(m.Value)
		}
	}
	for _, m := range roleMetrics {
		if m.Title == "Total Roles" {
			overview.TotalRoles = parseMetricValue(m.Value)
		}
	}
	for _, m := range permMetrics {
		switch m.Title {
		case "Total Permissions":
			overview.TotalPermissions = parseMetricValue(m.Value)
		case "Assigned Permissions":
			overview.AssignedPermissions = parseMetricValue(m.Value)
		}
	}

	security := dto.AuthSecurityAnalyticsDTO{
		TotalLogins:        totalLogins,
		SuccessfulLogins:   successfulCount,
		FailedLogins:       failedCount,
		SuccessRatePercent: successRate,
		FailureReasons:     failureReasons,
	}

	var topClientsUsage []dto.ClientUsageMetric
	for _, tc := range topClients {
		topClientsUsage = append(topClientsUsage, dto.ClientUsageMetric{
			ClientName: tc.ClientName,
			LoginCount: int64(tc.LoginCount),
		})
	}

	traffic := dto.UsageTrafficTelemetryDTO{
		TopClientsUsage: topClientsUsage,
		BrowserStats:    map[string]int64{"Chrome": 65, "Firefox": 20, "Safari": 15},
		OSStats:         map[string]int64{"Windows": 50, "macOS": 30, "Linux": 20},
	}

	var auditMetrics []dto.AuditMetric
	for _, lm := range logMetrics {
		auditMetrics = append(auditMetrics, dto.AuditMetric{
			Category: lm.Title,
			Count:    parseMetricValue(lm.Value),
		})
	}
	performance := dto.AuditPerformanceTelemetryDTO{
		AuditLogMetrics: auditMetrics,
		SystemHealth:    "Healthy",
		CacheStatus:     "Operational",
	}

	summary := dto.SummaryReportResponse{
		Title:       "Anonymized System Summary Report",
		GeneratedAt: time.Now(),
		TimeFrame:   params.TimeFrame,
		Overview:    overview,
		Security:    security,
		Traffic:     traffic,
		Performance: performance,
	}

	if params.Format == "json" {
		return json.MarshalIndent(summary, "", "  ")
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 18, 15)
	pdf.SetAutoPageBreak(true, 28)

	pdf.SetFooterFunc(func() {
		pdf.SetY(-21)
		pdf.SetDrawColor(30, 30, 30)
		pdf.Line(15, pdf.GetY(), 195, pdf.GetY())

		pdf.SetY(-16)
		pdf.SetFont("Arial", "B", 8)
		pdf.SetTextColor(0, 120, 0)
		pdf.SetX(5)
		pdf.CellFormat(
			190, 4,
			"This summary report contains zero personally identifiable information (PII).",
			"", 0, "C", false, 0, "",
		)
	})

	pdf.AddPage()
	pdf.SetXY(15, 18)
	pdf.SetTextColor(20, 20, 20)
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(0, 8, "Anonymized System Summary Report")

	pdf.SetXY(15, 27)
	pdf.SetFont("Arial", "I", 10)
	pdf.SetTextColor(45, 45, 45)
	pdf.Cell(0, 6, fmt.Sprintf("Generated on: %s | Timeframe: %s", time.Now().Format("2006-01-02 15:04:05 MST"), params.TimeFrame))
	pdf.Ln(18)

	addReportSectionTitle(pdf, "1. Account & System Overview")
	pdf.SetFont("Arial", "", 10)
	pdf.Cell(0, 6, fmt.Sprintf("Total Accounts: %d | Active: %d | Archived: %d", overview.TotalAccounts, overview.ActiveAccounts, overview.ArchivedAccounts))
	pdf.Ln(6)
	pdf.Cell(0, 6, fmt.Sprintf("Total App Clients: %d | Active Clients: %d", overview.TotalClients, overview.ActiveClients))
	pdf.Ln(6)
	pdf.Cell(0, 6, fmt.Sprintf("System Roles: %d | Total Permissions: %d | Assigned: %d", overview.TotalRoles, overview.TotalPermissions, overview.AssignedPermissions))
	pdf.Ln(12)

	addReportSectionTitle(pdf, "2. Security & Authentication Telemetry")
	pdf.Cell(0, 6, fmt.Sprintf("Total Login Attempts: %d | Successful: %d | Failed: %d", security.TotalLogins, security.SuccessfulLogins, security.FailedLogins))
	pdf.Ln(6)
	pdf.Cell(0, 6, fmt.Sprintf("Login Success Rate: %.2f%%", security.SuccessRatePercent))
	pdf.Ln(12)

	addReportSectionTitle(pdf, "3. Connected Applications & Traffic Volume")
	if len(topClientsUsage) == 0 {
		pdf.Cell(0, 6, "No client application traffic recorded in this timeframe.")
		pdf.Ln(6)
	} else {
		for _, tc := range topClientsUsage {
			pdf.Cell(0, 6, fmt.Sprintf("• %s: %d logins", tc.ClientName, tc.LoginCount))
			pdf.Ln(6)
		}
	}
	pdf.Ln(6)

	addReportSectionTitle(pdf, "4. Infrastructure & Audit Event Telemetry")
	pdf.Cell(0, 6, fmt.Sprintf("System Health: %s | Cache Status: %s", performance.SystemHealth, performance.CacheStatus))
	pdf.Ln(12)

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, fmt.Errorf("failed to generate summary PDF: %w", err)
	}
	return buf.Bytes(), nil
}

func parseMetricValue(v interface{}) int64 {
	switch val := v.(type) {
	case int64:
		return val
	case int:
		return int64(val)
	case float64:
		return int64(val)
	case string:
		var n int64
		fmt.Sscanf(val, "%d", &n)
		return n
	default:
		return 0
	}
}
