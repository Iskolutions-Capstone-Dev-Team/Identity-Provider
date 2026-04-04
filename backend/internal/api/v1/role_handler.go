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

// Action constants for audit logging
const (
	actionCreateRole = "create_role"
	actionListRoles  = "list_roles"
	actionGetRole    = "get_role"
	actionUpdateRole = "update_role"
	actionDeleteRole = "delete_role"
)

// RoleHandler handles role management HTTP requests.
type RoleHandler struct {
	Service    service.RoleService
	LogService service.LogService
}


// PostRole handles POST /v1/admin/roles
// @Summary Create a new role
// @Description Adds a new global or SP-prefixed role to the system
// @Tags Roles
// @Accept json
// @Produce json
// @Param body body dto.RoleRequest true "Role details"
// @Success 201 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /v1/admin/roles [post]
func (h *RoleHandler) PostRole(c *gin.Context) {
	if !middleware.HasPermission(c, "Add Roles") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	var req dto.RoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PostRole] Bind JSON: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid request payload"},
		)
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
		"role_name":  req.RoleName,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	err := h.Service.CreateRole(ctx, req)
	if err != nil {
		log.Printf("[PostRole] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionCreateRole,
				Target: req.RoleName,
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"role_name":  req.RoleName,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Role creation failed"},
		)
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionCreateRole,
			Target:   req.RoleName,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(
		http.StatusCreated,
		dto.SuccessResponse{Message: "Role created successfully"},
	)
}

// GetRoleList handles GET /v1/admin/roles
// @Summary List all roles
// @Description Retrieves a paginated list of non-deleted roles
// @Tags Roles
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Success 200 {object} dto.RoleListResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /v1/admin/roles [get]
func (h *RoleHandler) GetRoleList(c *gin.Context) {
	if !middleware.HasPermission(c, "View roles") {
		c.JSON(
			http.StatusUnauthorized, 
			dto.ErrorResponse{Error: "Unauthorized"},
		)
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	keyword := c.DefaultQuery("keyword", "")

	if page < 1 {
		page = 1
	}

	role := c.GetString("role")
	uIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(uIDStr)
	if err != nil {
		log.Printf("[GetRoleList] UUID Parse: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "identity parse error",
		})
		return
	}

	ctx := c.Request.Context()
	actorName, _ := h.LogService.GetUserEmail(ctx, userID[:])
	if actorName == "" {
		actorName = uIDStr
	}

	metadata := buildMetadata(map[string]interface{}{
		"limit":      limit,
		"page":       page,
		"keyword":    keyword,
		"privilege":  role,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	permissions := c.GetStringSlice("permissions")
	resp, err := h.Service.GetFilteredRoleList(
		ctx,
		permissions,
		userID,
		limit,
		page,
		keyword,
	)
	if err != nil {
		log.Printf("[GetRoleList] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionListRoles,
				Target: "role_list",
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"limit":      limit,
					"page":       page,
					"keyword":    keyword,
					"privilege":  role,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to retrieve roles",
		})
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionListRoles,
			Target:   "role_list",
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, resp)
}

// GetAllRoles handles GET /v1/admin/roles/all
// @Summary List all roles
// @Description Retrieves a paginated list of non-deleted roles
// @Tags Roles
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Success 200 {object} dto.RoleListResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /v1/admin/roles [get]
func (h *RoleHandler) GetAllRoles(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	keyword := c.DefaultQuery("keyword", "")
	if page < 1 {
		page = 1
	}

	resp, err := h.Service.GetAllExceptIDP(
		c.Request.Context(),
		service.PAGE_LIMIT,
		page,
		keyword,
	)
	if err != nil {
		log.Printf("[GetRoleList] %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Failed to fetch roles"},
		)
		return
	}

	c.JSON(http.StatusOK, resp)
}

// GetRole handles GET /v1/admin/roles/:id
// @Summary Get role by ID
// @Description Fetches full details of a specific role
// @Tags Roles
// @Accept json
// @Produce json
// @Param id path int true "Role ID"
// @Success 200 {object} dto.RoleResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /v1/admin/roles/{id} [get]
func (h *RoleHandler) GetRole(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("[GetRole] Parse ID: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid ID format"},
		)
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
		"role_id":    id,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	resp, err := h.Service.GetRoleByID(ctx, id)
	if err != nil {
		log.Printf("[GetRole] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionGetRole,
				Target: strconv.Itoa(id),
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"role_id":    id,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(
			http.StatusNotFound,
			dto.ErrorResponse{Error: "Role not found"},
		)
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionGetRole,
			Target:   resp.RoleName,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, resp)
}

// PutRole handles PUT /v1/admin/roles/:id
// @Summary Update an existing role
// @Description Modifies role name or description
// @Tags Roles
// @Accept json
// @Produce json
// @Param id path int true "Role ID"
// @Param body body dto.RoleRequest true "Updated role data"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /v1/admin/roles/{id} [put]
func (h *RoleHandler) PutRole(c *gin.Context) {
	if !middleware.HasPermission(c, "Edit Roles") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("[PutRole] Parse ID: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid ID format"},
		)
		return
	}

	var req dto.RoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PutRole] Bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
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
		"role_id":    id,
		"new_name":   req.RoleName,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	err = h.Service.UpdateRole(ctx, id, req)
	if err != nil {
		log.Printf("[PutRole] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionUpdateRole,
				Target: strconv.Itoa(id),
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"role_id":    id,
					"new_name":   req.RoleName,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Update failed"},
		)
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionUpdateRole,
			Target:   req.RoleName,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, dto.SuccessResponse{Message: "Role updated"})
}

// DeleteRole handles DELETE /v1/admin/roles/:id
// @Summary Soft delete a role
// @Description Marks a role as deleted in the audit trail
// @Tags Roles
// @Param id path int true "Role ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /v1/admin/roles/{id} [delete]
func (h *RoleHandler) DeleteRole(c *gin.Context) {
	if !middleware.HasPermission(c, "Delete Roles") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("[DeleteRole] Parse ID: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid ID format"},
		)
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
		"role_id":    id,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	err = h.Service.DeleteRole(ctx, id)
	if err != nil {
		log.Printf("[DeleteRole] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionDeleteRole,
				Target: strconv.Itoa(id),
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"role_id":    id,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Deletion failed"},
		)
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionDeleteRole,
			Target:   strconv.Itoa(id),
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(
		http.StatusOK,
		dto.SuccessResponse{Message: "Role deleted successfully"},
	)
}
