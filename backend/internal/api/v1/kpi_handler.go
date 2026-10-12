package v1

import (
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
	hasAllUsers := middleware.HasPermission(c, "View all users")
	hasClientUsers := middleware.HasPermission(
		c, "View users based on appclient",
	)

	if !hasLogs && !hasConn && !hasAll && !hasAllUsers && !hasClientUsers {
		c.JSON(
			http.StatusForbidden,
			gin.H{"error": "Insufficient permissions to view system KPIs."},
		)
		return
	}

	userIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		log.Printf("[KPIHandler] {Parse User ID}: %v", err)
		c.JSON(
			http.StatusBadRequest,
			gin.H{"error": "Invalid user context."},
		)
		return
	}

	permissions := c.GetStringSlice("permissions")
	ctx := c.Request.Context()
	kpis, err := h.KPIService.GetSystemKPIs(ctx, permissions, userID)
	if err != nil {
		log.Printf("[KPIHandler] {GetSystemKPIs}: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to fetch system KPIs."},
		)
		return
	}

	c.JSON(http.StatusOK, kpis)
}
