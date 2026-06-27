package v1

import (
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/errors"
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
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid user context.",
			err,
		)
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
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to retrieve dashboard metrics.",
			err,
		)
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
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid user context.",
			err,
		)
		return
	}

	permissions := c.GetStringSlice("permissions")

	pdfBytes, err := h.MetricsService.GenerateReportPDF(
		c.Request.Context(),
		userID,
		permissions,
	)
	if err != nil {
		log.Printf("[MetricsHandler] GetMetricsReportPDF error: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to generate metrics report.",
			err,
		)
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header(
		"Content-Disposition",
		"attachment; filename=\"metrics_report.pdf\"",
	)
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}
