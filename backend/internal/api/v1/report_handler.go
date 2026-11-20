package v1

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/errors"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ReportHandler struct {
	ReportService    service.ReportService
	RetentionService service.RetentionService
}

func NewReportHandler(svc service.ReportService, retSvc ...service.RetentionService) *ReportHandler {
	var r service.RetentionService
	if len(retSvc) > 0 {
		r = retSvc[0]
	}
	return &ReportHandler{
		ReportService:    svc,
		RetentionService: r,
	}
}

// GetSystemReport generates and streams the system report in PDF or JSON.
func (h *ReportHandler) GetSystemReport(c *gin.Context) {
	hasAllUsers := middleware.HasPermission(c, "View all users")
	hasClientUsers := middleware.HasPermission(
		c, "View users based on appclient",
	)
	hasClientsPerm := middleware.HasPermission(c, "View all appclients")
	hasLogsPerm := middleware.HasPermission(c, "View audit logs")

	if !hasAllUsers && !hasClientUsers && !hasClientsPerm && !hasLogsPerm {
		errors.SendString(
			c,
			http.StatusForbidden,
			errors.CodeForbidden,
			"You do not have permission to view any report section.",
			"Forbidden",
		)
		return
	}

	var params dto.SystemReportParams
	if err := c.ShouldBindQuery(&params); err != nil {
		log.Printf("[ReportHandler] {Bind Query}: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid query parameters",
		})
		return
	}

	// Dynamic constraint mapping to filter out unauthorized requests for
	// specific sections
	if !hasAllUsers && !hasClientUsers {
		params.IncludeUsers = false
	}
	if !hasClientsPerm {
		params.IncludeClients = false
	}
	if !hasLogsPerm {
		params.IncludeLogs = false
	}

	userIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		log.Printf("[ReportHandler] {Parse User ID}: %v", err)
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid user context.",
			err,
		)
		return
	}

	ctx := c.Request.Context()
	permissions := c.GetStringSlice("permissions")

	reportBytes, err := h.ReportService.GenerateSystemReport(
		ctx, permissions, userID, params,
	)
	if err != nil {
		log.Printf("[ReportHandler] {Generate System Report}: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to generate system report.",
			err,
		)
		return
	}

	if params.Format == "json" {
		c.Header("Content-Type", "application/json")
		c.Header(
			"Content-Disposition",
			"attachment; filename=\"system_report.json\"",
		)
		c.Data(http.StatusOK, "application/json", reportBytes)
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header(
		"Content-Disposition",
		"attachment; filename=\"system_report.pdf\"",
	)
	c.Data(http.StatusOK, "application/pdf", reportBytes)
}

// GetSummaryReport generates and streams an anonymized non-PII summary report.
func (h *ReportHandler) GetSummaryReport(c *gin.Context) {
	hasLogsPerm := middleware.HasPermission(c, "View audit logs")
	hasAllUsers := middleware.HasPermission(c, "View all users")
	hasClientUsers := middleware.HasPermission(
		c, "View users based on appclient",
	)
	hasClientsPerm := middleware.HasPermission(c, "View all appclients")

	if !hasLogsPerm && !hasAllUsers && !hasClientUsers && !hasClientsPerm {
		errors.SendString(
			c,
			http.StatusForbidden,
			errors.CodeForbidden,
			"You do not have permission to view summary reports.",
			"Forbidden",
		)
		return
	}

	var params dto.SummaryReportParams
	if err := c.ShouldBindQuery(&params); err != nil {
		log.Printf("[ReportHandler] {GetSummaryReport Bind Query}: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid query parameters",
		})
		return
	}

	userIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		log.Printf("[ReportHandler] {Parse User ID}: %v", err)
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid user context.",
			err,
		)
		return
	}

	ctx := c.Request.Context()
	permissions := c.GetStringSlice("permissions")
	reportBytes, err := h.ReportService.GenerateSummaryReport(
		ctx, permissions, userID, params,
	)
	if err != nil {
		log.Printf("[ReportHandler] {Generate Summary Report}: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to generate summary report.",
			err,
		)
		return
	}

	if params.Format == "json" {
		c.Header("Content-Type", "application/json")
		c.Header(
			"Content-Disposition",
			"attachment; filename=\"summary_report.json\"",
		)
		c.Data(http.StatusOK, "application/json", reportBytes)
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header(
		"Content-Disposition",
		"attachment; filename=\"summary_report.pdf\"",
	)
	c.Data(http.StatusOK, "application/pdf", reportBytes)
}

// GetAnalyticsReport returns aggregated KPIs and timeseries points for date ranges up to 1 year.
// @Summary Get 1-Year Analytics Report
// @Description Provides high-level security and audit metrics and timeseries data up to 366 days.
// @Tags Reports
// @Produce json
// @Param from query string true "From date (YYYY-MM-DD or RFC3339)"
// @Param to query string true "To date (YYYY-MM-DD or RFC3339)"
// @Param interval query string false "Interval (day, week, month)"
// @Param type query string false "Type (all, audit, security)"
// @Success 200 {object} dto.AnalyticsReportResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /reports [get]
func (h *ReportHandler) GetAnalyticsReport(c *gin.Context) {
	if !middleware.HasPermission(c, "View audit logs") &&
		!middleware.HasPermission(c, "View security logs") {
		errors.SendString(
			c,
			http.StatusForbidden,
			errors.CodeForbidden,
			"You do not have permission to view reports.",
			"Forbidden",
		)
		return
	}

	var query dto.AnalyticsReportQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		log.Printf("[ReportHandler] {Bind Analytics Query}: %v", err)
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid report parameters.",
			err,
		)
		return
	}

	report, err := h.ReportService.GetAnalyticsReport(c.Request.Context(), query)
	if err != nil {
		log.Printf("[ReportHandler] {GetAnalyticsReport}: %v", err)
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			err.Error(),
			err,
		)
		return
	}

	c.JSON(http.StatusOK, report)
}

// ExportReportCSV streams CSV log export for date ranges up to 1 year.
// @Summary Export Report as CSV
// @Description Streams raw audit and security log records in CSV format directly in chunks.
// @Tags Reports
// @Produce text/csv
// @Param from query string true "From date (YYYY-MM-DD or RFC3339)"
// @Param to query string true "To date (YYYY-MM-DD or RFC3339)"
// @Param type query string false "Type (all, audit, security)"
// @Success 200 {file} binary
// @Failure 400 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /reports/export [get]
func (h *ReportHandler) ExportReportCSV(c *gin.Context) {
	if !middleware.HasPermission(c, "View audit logs") &&
		!middleware.HasPermission(c, "View security logs") {
		errors.SendString(
			c,
			http.StatusForbidden,
			errors.CodeForbidden,
			"You do not have permission to export reports.",
			"Forbidden",
		)
		return
	}

	var query dto.ReportExportQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		log.Printf("[ReportHandler] {Bind Export Query}: %v", err)
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid export parameters.",
			err,
		)
		return
	}

	filename := fmt.Sprintf("report-%s.csv", time.Now().UTC().Format("20060102_150405"))
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))
	c.Header("Transfer-Encoding", "chunked")

	if err := h.ReportService.StreamExportCSV(c.Request.Context(), query, c.Writer); err != nil {
		log.Printf("[ReportHandler] {StreamExportCSV}: %v", err)
		return
	}
}

// TriggerRetentionRun manually executes the log retention and archival process.
// @Summary Manually Trigger Log Retention
// @Description Archives logs older than 13 months to MinIO/S3 and purges them from MySQL (Superadmin only).
// @Tags Retention
// @Produce json
// @Success 200 {object} dto.RetentionRunResponse
// @Failure 403 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /logs/retention/run [post]
func (h *ReportHandler) TriggerRetentionRun(c *gin.Context) {
	if !middleware.IsSuperadmin(c) {
		errors.SendString(
			c,
			http.StatusForbidden,
			errors.CodeForbidden,
			"Only superadmins can trigger log retention cleanup.",
			"Forbidden",
		)
		return
	}

	if h.RetentionService == nil {
		errors.SendString(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Retention service is not configured.",
			"Internal Error",
		)
		return
	}

	result, err := h.RetentionService.ExecuteRetention(c.Request.Context())
	if err != nil {
		log.Printf("[ReportHandler] {TriggerRetentionRun}: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to execute log retention.",
			err,
		)
		return
	}

	c.JSON(http.StatusOK, result)
}
