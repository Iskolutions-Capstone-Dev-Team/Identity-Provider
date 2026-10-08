package v1

import (
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
)

type KPIHandler struct {
	KPIService service.KPIService
}

func NewKPIHandler(svc service.KPIService) *KPIHandler {
	return &KPIHandler{KPIService: svc}
}

// GetSystemKPIs returns aggregated system Key Performance Indicators.
func (h *KPIHandler) GetSystemKPIs(c *gin.Context) {
	hasLogs := middleware.HasPermission(c, "View audit logs")
	hasConn := middleware.HasPermission(
		c, "View connected appclients",
	)
	hasAll := middleware.HasPermission(
		c, "View all appclients",
	)

	if !hasLogs && !hasConn && !hasAll {
		c.JSON(
			http.StatusForbidden,
			gin.H{"error": "Insufficient permissions to view system KPIs."},
		)
		return
	}

	ctx := c.Request.Context()
	kpis, err := h.KPIService.GetSystemKPIs(ctx)
	if err != nil {
		log.Printf("[KPIHandler] GetSystemKPIs: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to fetch system KPIs."},
		)
		return
	}

	c.JSON(http.StatusOK, kpis)
}
