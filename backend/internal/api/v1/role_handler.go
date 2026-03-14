package v1

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Action constants for audit logging
const (
	actionCreateRole  = "create_role"
	actionListRoles   = "list_roles"
	actionGetRole     = "get_role"
	actionSearchRoles = "search_roles"
	actionUpdateRole  = "update_role"
	actionDeleteRole  = "delete_role"
)

// RoleHandler handles role management HTTP requests.
type RoleHandler struct {
	Service          *service.RoleService
	PrivilegeService *service.PrivilegeService
	LogService       *service.LogService
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
	var req dto.RoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PostRole] Bind JSON: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid request payload"},
		)
		return
	}

	// Get actor from context
	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr) // ignore error, fallback to string
	actorName, _ := h.LogService.GetUserEmail(userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	// Prepare metadata
	metadata := buildMetadata(map[string]interface{}{
		"role_name":  req.RoleName,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	err := h.Service.CreateRole(c.Request.Context(), req)
	if err != nil {
		log.Printf("[PostRole] %v", err)
		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
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

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(actorName,
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
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	keyword := c.DefaultQuery("keyword", "")

	if page < 1 {
		page = 1
	}

	// 1. Privilege Check
	level, err := h.PrivilegeService.CheckUserPrivilege(c)
	if err != nil {
		log.Printf("[GetRoleList] Privilege Validation: %v", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "unauthorized access",
		})
		return
	}

	// 2. Identity Extraction
	uIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(uIDStr)
	if err != nil {
		log.Printf("[GetRoleList] UUID Parse: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "identity parse error",
		})
		return
	}

	// Resolve actor name
	actorName, _ := h.LogService.GetUserEmail(userID[:])
	if actorName == "" {
		actorName = uIDStr
	}

	// Prepare metadata
	metadata := buildMetadata(map[string]interface{}{
		"limit":      limit,
		"page":       page,
		"keyword":    keyword,
		"privilege":  level,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	// 3. Service Execution
	resp, err := h.Service.GetFilteredRoleList(
		c.Request.Context(),
		level,
		userID,
		limit,
		page,
		keyword,
	)
	if err != nil {
		log.Printf("[GetRoleList] %v", err)
		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
			&dto.PostAuditLogRequest{
				Action: actionListRoles,
				Target: "role_list",
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"limit":      limit,
					"page":       page,
					"keyword":    keyword,
					"privilege":  level,
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

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(actorName,
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

	// Get actor
	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	// Prepare metadata (role ID known, name will be added after fetch if successful)
	metadata := buildMetadata(map[string]interface{}{
		"role_id":    id,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	resp, err := h.Service.GetRoleByID(c.Request.Context(), id)
	if err != nil {
		log.Printf("[GetRole] %v", err)
		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
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

	// Log success with role name
	_ = h.LogService.PostAuditLogWithActorString(actorName,
		&dto.PostAuditLogRequest{
			Action:   actionGetRole,
			Target:   resp.RoleName,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, resp)
}

// GetRolesBySearch retrieves a filtered list of roles by keyword.
// @Summary Search roles by keyword
// @Description Searches for roles matching the provided query parameter.
// @Tags Roles
// @Accept json
// @Produce json
// @Param keyword query string true "Search term for role names"
// @Success 200 {object} dto.RoleListResponse "Success"
// @Failure 404 {object} dto.ErrorResponse
// @Failure 501 {object} dto.ErrorResponse
// @Router /api/roles [get]
func (h *RoleHandler) GetRolesBySearch(c *gin.Context) {
	keyword := c.Query("keyword")

	// Get actor
	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	// Prepare metadata
	metadata := buildMetadata(map[string]interface{}{
		"keyword":    keyword,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	resp, err := h.Service.SearchRoles(c.Request.Context(), keyword)
	if err != nil {
		log.Printf("[GetRolesBySearch] %v", err)

		// Determine if error is "not found" or a system failure
		status := http.StatusInternalServerError
		msg := "fetching error"
		if strings.Contains(err.Error(), "no records") {
			status = http.StatusNotFound
			msg = "role not found using keyword"
		}

		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
			&dto.PostAuditLogRequest{
				Action: actionSearchRoles,
				Target: "role_search",
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"keyword":    keyword,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(status, dto.ErrorResponse{Error: msg})
		return
	}

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(actorName,
		&dto.PostAuditLogRequest{
			Action:   actionSearchRoles,
			Target:   "role_search",
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

	// Get actor
	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	// Prepare metadata (role ID known, name may be updated)
	metadata := buildMetadata(map[string]interface{}{
		"role_id":    id,
		"new_name":   req.RoleName,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	err = h.Service.UpdateRole(c.Request.Context(), id, req)
	if err != nil {
		log.Printf("[PutRole] %v", err)
		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
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

	// Log success (use new name as target)
	_ = h.LogService.PostAuditLogWithActorString(actorName,
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
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("[DeleteRole] Parse ID: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid ID format"},
		)
		return
	}

	// Get actor
	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	// To get role name for target, we could fetch it first, but that adds overhead.
	// Use ID as target, optionally include name in metadata if fetched.
	metadata := buildMetadata(map[string]interface{}{
		"role_id":    id,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	err = h.Service.DeleteRole(c.Request.Context(), id)
	if err != nil {
		log.Printf("[DeleteRole] %v", err)
		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
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

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(actorName,
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
