package v1

import (
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MetricsHandler struct {
	MetricsService service.MetricsService
}

func NewMetricsHandler(svc service.MetricsService) *MetricsHandler {
	return &MetricsHandler{MetricsService: svc}
}

// GetDashboardMetrics returns login stats and threat analysis.
func (h *MetricsHandler) GetDashboardMetrics(c *gin.Context) {
	userIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		log.Printf(
			"[MetricsHandler] GetDashboardMetrics: invalid user ID: %v",
			err,
		)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user context"})
		return
	}

	permissions := c.GetStringSlice("permissions")

	metrics, err := h.MetricsService.GetDashboardMetrics(
		c.Request.Context(),
		userID,
		permissions,
	)
	if err != nil {
		log.Printf("[MetricsHandler] GetDashboardMetrics error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to retrieve dashboard metrics",
		})
		return
	}

	c.JSON(http.StatusOK, metrics)
}

// GetMetricsReportPDF generates and streams the PDF report.
func (h *MetricsHandler) GetMetricsReportPDF(c *gin.Context) {
	userIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		log.Printf(
			"[MetricsHandler] GetMetricsReportPDF: invalid user ID: %v",
			err,
		)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user context"})
		return
	}

	permissions := c.GetStringSlice("permissions")

	filter := models.ReportFilter{
		IncludeSecurityAnalysis: true,
		IncludeAuthStats:        true,
		IncludeFailedAttempts:   true,
	}

	if err := c.ShouldBindQuery(&filter); err != nil {
		log.Printf("[MetricsHandler] Bind Query: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid query parameters",
		})
		return
	}

	pdfBytes, err := h.MetricsService.GenerateReportPDF(
		c.Request.Context(),
		userID,
		permissions,
		filter,
	)
	if err != nil {
		log.Printf("[MetricsHandler] GetMetricsReportPDF error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to generate metrics report",
		})
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header(
		"Content-Disposition",
		"attachment; filename=\"metrics_report.pdf\"",
	)
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}
