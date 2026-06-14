package v1

import (
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
)

type MetricsHandler struct {
	MetricsService service.MetricsService
}

func NewMetricsHandler(svc service.MetricsService) *MetricsHandler {
	return &MetricsHandler{MetricsService: svc}
}

// GetDashboardMetrics returns login stats and threat analysis.
func (h *MetricsHandler) GetDashboardMetrics(c *gin.Context) {
	metrics, err := h.MetricsService.GetDashboardMetrics(
		c.Request.Context(),
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
	pdfBytes, err := h.MetricsService.GenerateReportPDF(
		c.Request.Context(),
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
