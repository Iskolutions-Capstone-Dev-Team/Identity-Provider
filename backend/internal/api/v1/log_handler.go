package v1

import (
	"log"
	"net/http"
	"strconv"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
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
	LogService service.LogService
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
	if !middleware.HasPermission(c, "View audit logs") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}

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
		filters["from_date"] = from
	}
	if to := c.Query("to_date"); to != "" {
		filters["to_date"] = to
	}

	ctx := c.Request.Context()
	logs, total, lastPage, err := h.LogService.GetLogListWithFilters(
		ctx, filters, limit, page)
	if err != nil {
		log.Printf("[GetLogList] Service Execution: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to retrieve logs",
		})
		return
	}

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

	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	ctx := c.Request.Context()
	actorName, _ := h.LogService.GetUserEmail(ctx, userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	metadata := buildMetadata(map[string]interface{}{
		"log_id":     id,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	logEntry, err := h.LogService.GetLogByID(ctx, id)
	if err != nil {
		log.Printf("[GetLog] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
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

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionGetLog,
			Target:   idParam,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, logEntry)
}

// GetSecurityLogList handles GET /api/v1/logs/security
// @Summary List security logs
// @Description Returns a paginated list of security logs with optional filters.
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
// @Router /api/v1/logs/security [get]
func (h *LogHandler) GetSecurityLogList(c *gin.Context) {
	if !middleware.HasPermission(c, "View audit logs") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}

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
		filters["from_date"] = from
	}
	if to := c.Query("to_date"); to != "" {
		filters["to_date"] = to
	}

	ctx := c.Request.Context()
	logs, total, lastPage, err := h.LogService.GetSecurityLogListWithFilters(
		ctx, filters, limit, page)
	if err != nil {
		log.Printf("[GetSecurityLogList] Service Execution: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to retrieve logs",
		})
		return
	}

	resp := dto.GetAuditLogListResponse{
		AuditLogs:   logs,
		TotalCount:  total,
		CurrentPage: page,
		LastPage:    lastPage,
	}
	c.JSON(http.StatusOK, resp)
}

// GetSecurityLog handles GET /api/v1/logs/security/:id
// @Summary Get security log by ID
// @Description Returns a single security log entry.
// @Tags Logs
// @Produce json
// @Param id path int true "Log ID"
// @Success 200 {object} dto.PostAuditLogRequest
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/logs/security/{id} [get]
func (h *LogHandler) GetSecurityLog(c *gin.Context) {
	if !middleware.HasPermission(c, "View audit logs") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		log.Printf("[GetSecurityLog] Parse ID: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid log ID",
		})
		return
	}

	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	ctx := c.Request.Context()
	actorName, _ := h.LogService.GetUserEmail(ctx, userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	metadata := buildMetadata(map[string]interface{}{
		"log_id":     id,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	logEntry, err := h.LogService.GetSecurityLogByID(ctx, id)
	if err != nil {
		log.Printf("[GetSecurityLog] %v", err)
		_ = h.LogService.PostSecurityLogWithActorString(ctx, actorName,
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

	_ = h.LogService.PostSecurityLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionGetLog,
			Target:   idParam,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, logEntry)
}
