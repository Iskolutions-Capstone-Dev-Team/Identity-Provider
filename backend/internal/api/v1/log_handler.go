package v1

import (
	"log"
	"net/http"
	"strconv"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Action constants for audit logging (logs themselves)
const (
	actionListLogs = "list_logs"
	actionGetLog   = "get_log"
)

// LogHandler handles audit log retrieval HTTP requests.
type LogHandler struct {
	LogService *service.LogService
}

// GetLogList handles GET /api/v1/logs
// @Summary List audit logs
// @Description Returns a paginated list of audit logs with optional filters.
// @Tags Logs
// @Produce json
// @Param limit query int false "Items per page" default(10)
// @Param page query int false "Page number" default(1)
// @Param actor query string false "Filter by actor (email or ID)"
// @Param action query string false "Filter by action"
// @Param target query string false "Filter by target"
// @Param status query string false "Filter by status (success/fail)"
// @Param from_date query string false "Filter by created_at >= (RFC3339)"
// @Param to_date query string false "Filter by created_at <= (RFC3339)"
// @Success 200 {object} dto.GetAuditLogListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/logs [get]
func (h *LogHandler) GetLogList(c *gin.Context) {
	// RBAC Check
	if !middleware.HasPermission(c, "View audit logs") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	// Parse pagination
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}

	// Build filters map
	filters := make(map[string]interface{})
	if actor := c.Query("actor"); actor != "" {
		filters["actor"] = actor
	}
	if action := c.Query("action"); action != "" {
		filters["action"] = action
	}
	if target := c.Query("target"); target != "" {
		filters["target"] = target
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if from := c.Query("from_date"); from != "" {
		// Validate date format? We'll pass as string; DB will handle.
		filters["from_date"] = from
	}
	if to := c.Query("to_date"); to != "" {
		filters["to_date"] = to
	}

	// Get actor from context for audit logging
	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	// Prepare metadata for audit log
	metadata := buildMetadata(map[string]interface{}{
		"limit":      limit,
		"page":       page,
		"filters":    filters,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	// Call service
	logs, total, lastPage, err := h.LogService.GetLogListWithFilters(
		filters, limit, page)
	if err != nil {
		log.Printf("[GetLogList] Service Execution: %v", err)
		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
			&dto.PostAuditLogRequest{
				Action: actionListLogs,
				Target: "log_list",
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"limit":      limit,
					"page":       page,
					"filters":    filters,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to retrieve logs",
		})
		return
	}

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(actorName,
		&dto.PostAuditLogRequest{
			Action:   actionListLogs,
			Target:   "log_list",
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	// Build response
	resp := dto.GetAuditLogListResponse{
		AuditLogs:   logs,
		TotalCount:  total,
		CurrentPage: page,
		LastPage:    lastPage,
	}
	c.JSON(http.StatusOK, resp)
}

// GetLog handles GET /api/v1/logs/:id
// @Summary Get audit log by ID
// @Description Returns a single audit log entry.
// @Tags Logs
// @Produce json
// @Param id path int true "Log ID"
// @Success 200 {object} dto.PostAuditLogRequest
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/logs/{id} [get]
func (h *LogHandler) GetLog(c *gin.Context) {
	// RBAC Check
	if !middleware.HasPermission(c, "View audit logs") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		log.Printf("[GetLog] Parse ID: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid log ID",
		})
		return
	}

	// Get actor from context
	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	// Prepare metadata
	metadata := buildMetadata(map[string]interface{}{
		"log_id":     id,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	logEntry, err := h.LogService.GetLogByID(id)
	if err != nil {
		log.Printf("[GetLog] %v", err)
		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
			&dto.PostAuditLogRequest{
				Action: actionGetLog,
				Target: idParam,
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"log_id":     id,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "Log not found",
		})
		return
	}

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(actorName,
		&dto.PostAuditLogRequest{
			Action:   actionGetLog,
			Target:   idParam,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, logEntry)
}
