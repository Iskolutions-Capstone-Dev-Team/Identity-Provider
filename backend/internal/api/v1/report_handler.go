package v1

import (
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/errors"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
)

type ReportHandler struct {
	ReportService service.ReportService
}

func NewReportHandler(svc service.ReportService) *ReportHandler {
	return &ReportHandler{ReportService: svc}
}

// GetSystemReport generates and streams the system report in PDF or JSON.
func (h *ReportHandler) GetSystemReport(c *gin.Context) {
	hasUsersPerm := middleware.HasPermission(c, "View all users")
	hasClientsPerm := middleware.HasPermission(c, "View all appclients")
	hasLogsPerm := middleware.HasPermission(c, "View audit logs")

	if !hasUsersPerm && !hasClientsPerm && !hasLogsPerm {
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
		log.Printf("[ReportHandler] Bind Query: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid query parameters",
		})
		return
	}

	// Dynamic constraint mapping to filter out unauthorized requests for
	// specific sections
	if !hasUsersPerm {
		params.IncludeUsers = false
	}
	if !hasClientsPerm {
		params.IncludeClients = false
	}
	if !hasLogsPerm {
		params.IncludeLogs = false
	}

	ctx := c.Request.Context()
	permissions := c.GetStringSlice("permissions")

	reportBytes, err := h.ReportService.GenerateSystemReport(
		ctx, permissions, params,
	)
	if err != nil {
		log.Printf("[ReportHandler] Generate System Report: %v", err)
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
	hasUsersPerm := middleware.HasPermission(c, "View all users")
	hasClientsPerm := middleware.HasPermission(c, "View all appclients")

	if !hasLogsPerm && !hasUsersPerm && !hasClientsPerm {
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
		log.Printf("[ReportHandler] GetSummaryReport Bind Query: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid query parameters",
		})
		return
	}

	ctx := c.Request.Context()
	reportBytes, err := h.ReportService.GenerateSummaryReport(ctx, params)
	if err != nil {
		log.Printf("[ReportHandler] Generate Summary Report: %v", err)
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
