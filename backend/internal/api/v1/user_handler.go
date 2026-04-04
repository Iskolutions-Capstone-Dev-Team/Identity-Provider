package v1

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Action constants for audit logging
const (
	actionCreateUser   = "create_user"
	actionListUsers    = "list_users"
	actionGetUser      = "get_user"
	actionGetMe        = "get_me"
	actionUpdatePass   = "update_password"
	actionUpdateStatus = "update_status"
	actionUpdateUserRole = "update_user_role"
	actionDeleteUser   = "delete_user"
)

// UserHandler handles user management HTTP requests.
type UserHandler struct {
	Service    service.UserService
	LogService service.LogService
}


// PostUser creates a new user in the system
// @Summary Create User
// @Description Register a new user with roles and encrypted password
// @Tags Users
// @Accept json
// @Produce json
// @Param user body dto.UserRequest true "User Data"
// @Success 201 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/users [post]
func (h *UserHandler) PostUser(c *gin.Context) {
	if !middleware.HasPermission(c, "Add user") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	var req dto.UserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PostUser] Bind JSON: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "invalid request payload"},
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
		"target_email": req.Email,
		"ip":           c.ClientIP(),
		"user_agent":   c.Request.UserAgent(),
	})

	createdID, err := h.Service.CreateUser(ctx, req)
	if err != nil {
		log.Printf("[PostUser] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionCreateUser,
				Target: req.Email,
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"target_email": req.Email,
					"ip":           c.ClientIP(),
					"user_agent":   c.Request.UserAgent(),
					"error":        err.Error(),
				}),
			})
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "failed to create user"},
		)
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionCreateUser,
			Target:   req.Email,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	message := fmt.Sprintf("Created user with the id %s", createdID)
	c.JSON(http.StatusCreated, dto.SuccessResponse{Message: message})
}

// GetUserList retrieves a paginated list of users
// @Summary List Users
// @Description Get a paginated list of all users
// @Tags Users
// @Produce json
// @Param page query int false "Page number" default(1)
// @Success 200 {object} dto.UserResponseList
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/users [get]
func (h *UserHandler) GetUserList(c *gin.Context) {
	const defaultLimit = "10"
	const defaultPage = "1"

	// RBAC Check
	if !middleware.HasPermission(c, "View all users") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	page, _ := strconv.Atoi(c.DefaultQuery("page", defaultPage))

	if page < 1 {
		page = 1
	}

	role := c.GetString("role")
	uIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(uIDStr)
	if err != nil {
		log.Printf("[GetUserList] UUID Parsing: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Identity parse error"},
		)
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
		"privilege":  role,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	permissions := c.GetStringSlice("permissions")
	resp, err := h.Service.GetFilteredUserList(
		ctx,
		permissions,
		userID,
		limit,
		page,
	)
	if err != nil {
		log.Printf("[GetUserList] Service Execution: %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionListUsers,
				Target: "user_list",
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"limit":      limit,
					"page":       page,
					"privilege":  role,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Failed to retrieve user list"},
		)
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionListUsers,
			Target:   "user_list",
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, resp)
}

// GetUser retrieves a single user by their UUID string
// @Summary Get User
// @Description Fetch user details using their unique ID
// @Tags Users
// @Produce json
// @Param id path string true "User ID (UUID)"
// @Success 200 {object} dto.UserResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 440 {object} dto.ErrorResponse
// @Router /api/v1/users/{id} [get]
func (h *UserHandler) GetUser(c *gin.Context) {
	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		log.Printf("[GetUser] UUID Parse: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid ID Format"},
		)
		return
	}

	actorIDStr := c.GetString("user_id")
	actorID, _ := uuid.Parse(actorIDStr)
	ctx := c.Request.Context()
	actorName, _ := h.LogService.GetUserEmail(ctx, actorID[:])
	if actorName == "" {
		actorName = actorIDStr
	}

	metadata := buildMetadata(map[string]interface{}{
		"target_id":  id,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	resp, err := h.Service.GetUserByID(ctx, userID)
	if err != nil {
		log.Printf("[GetUser] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionGetUser,
				Target: id,
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"target_id":  id,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(
			http.StatusNotFound,
			dto.ErrorResponse{Error: "User not found"},
		)
		return
	}

	targetName := resp.Email
	if targetName == "" {
		targetName = id
	}
	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionGetUser,
			Target:   targetName,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, resp)
}

// GetMe retrieves user information based on the access token bearer auth
// @Summary      Get authenticated user info
// @Description  Returns user profile filtered by client allowed roles
// @Tags         Users
// @Produce      json
// @Success      200  {object}  dto.UserInfoResponse
// @Failure      400  {object}  dto.ErrorResponse
// @Failure      404  {object}  dto.ErrorResponse
// @Router       /me [get]
// @Security     BearerAuth
func (h *UserHandler) GetMe(c *gin.Context) {
	uVal, uExists := c.Get("user_id")
	cVal, cExists := c.Get("client_id")

	if !uExists || !cExists {
		log.Print("[GetMe] Context Extraction: missing identifiers")
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "missing session context",
		})
		return
	}

	uID, uErr := uuid.Parse(uVal.(string))
	cID, cErr := uuid.Parse(cVal.(string))

	if uErr != nil || cErr != nil {
		log.Printf("[GetMe] Token Generation: invalid uuid format")
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid identification format",
		})
		return
	}

	ctx := c.Request.Context()
	actorName, _ := h.LogService.GetUserEmail(ctx, uID[:])
	if actorName == "" {
		actorName = uVal.(string)
	}

	metadata := buildMetadata(map[string]interface{}{
		"client_id":  cID.String(),
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	resp, err := h.Service.GetMe(ctx, uID, cID)
	if err != nil {
		log.Printf("[GetMe] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionGetMe,
				Target: "self",
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"client_id":  cID.String(),
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "user information not found",
		})
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionGetMe,
			Target:   "self",
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, resp)
}

// PatchUserPassword updates a user's password.
// @Summary Update user password
// @Description Updates the password for a specific user identified by ID.
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param request body dto.UpdatePasswordRequest true "Password Update Data"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 501 {object} dto.ErrorResponse
// @Router /api/v1/users/{id}/password [patch]
func (h *UserHandler) PatchUserPassword(c *gin.Context) {
	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		log.Printf("[PatchUserPassword] UUID Parse: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid ID Format"},
		)
		return
	}

	if !middleware.HasPermission(c, "Edit user") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	var req dto.UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PatchUserPassword] Bind JSON: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "invalid request body"},
		)
		return
	}

	actorIDStr := c.GetString("user_id")
	actorID, _ := uuid.Parse(actorIDStr)
	ctx := c.Request.Context()
	actorName, _ := h.LogService.GetUserEmail(ctx, actorID[:])
	if actorName == "" {
		actorName = actorIDStr
	}

	metadata := buildMetadata(map[string]interface{}{
		"target_id":  id,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	err = h.Service.UpdateUserPassword(
		ctx,
		userID,
		req.NewPassword,
	)
	if err != nil {
		log.Printf("[PatchUserPassword] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionUpdatePass,
				Target: id,
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"target_id":  id,
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
			Action:   actionUpdatePass,
			Target:   id,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Password Updated Successfully!",
	})
}

// PatchUserStatus updates the operational status of a user.
// @Summary Update user status
// @Description Modifies the status (e.g., active, disabled) of a user by ID.
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param request body dto.UpdateStatusRequest true "Status Update Data"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 501 {object} dto.ErrorResponse
// @Router /api/v1/users/{id}/status [patch]
func (h *UserHandler) PatchUserStatus(c *gin.Context) {
	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		log.Printf("[PatchUserStatus] UUID Parse: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid ID Format"},
		)
		return
	}

	if !middleware.HasPermission(c, "Edit user") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	var req dto.UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PatchUserStatus] Bind JSON: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid input"},
		)
		return
	}

	actorIDStr := c.GetString("user_id")
	actorID, _ := uuid.Parse(actorIDStr)
	ctx := c.Request.Context()
	actorName, _ := h.LogService.GetUserEmail(ctx, actorID[:])
	if actorName == "" {
		actorName = actorIDStr
	}

	metadata := buildMetadata(map[string]interface{}{
		"target_id":  id,
		"new_status": req.NewStatus,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	err = h.Service.UpdateUserStatus(
		ctx,
		userID,
		req.NewStatus,
	)
	if err != nil {
		log.Printf("[PatchUserStatus] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionUpdateStatus,
				Target: id,
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"target_id":  id,
					"new_status": req.NewStatus,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		if strings.Contains(err.Error(), "Status Validation") {
			c.JSON(
				http.StatusBadRequest,
				dto.ErrorResponse{Error: "Invalid status provided"},
			)
			return
		}
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Update failed"},
		)
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionUpdateStatus,
			Target:   id,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Status Updated Successfully!",
	})
}

// PatchUserRole updates the role assigned to a specific user.
// @Summary Update user role
// @Description Updates a user's role based on the request body.
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param request body dto.UpdateUserRoleRequest true "Role update data"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /users/{id}/role [patch]
func (h *UserHandler) PatchUserRole(c *gin.Context) {
	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		log.Printf("[PatchUserRoles] UUID Parse: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid ID Format"},
		)
		return
	}

	if !middleware.HasPermission(c, "Assign Roles") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	var req dto.UpdateUserRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PatchUserRole] Bind JSON: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid input"},
		)
		return
	}

	actorIDStr := c.GetString("user_id")
	actorID, _ := uuid.Parse(actorIDStr)
	ctx := c.Request.Context()
	actorName, _ := h.LogService.GetUserEmail(ctx, actorID[:])
	if actorName == "" {
		actorName = actorIDStr
	}

	metadata := buildMetadata(map[string]interface{}{
		"target_id":  id,
		"role_id":    req.RoleID,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	permissions := c.GetStringSlice("permissions")
	err = h.Service.UpdateUserRole(
		ctx,
		userID,
		req.RoleID,
		actorID,
		permissions,
	)
	if err != nil {
		log.Printf("[PatchUserRole] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionUpdateUserRole,
				Target: id,
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"target_id":  id,
					"role_id":    req.RoleID,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		if strings.Contains(err.Error(), "permitted") {
			c.JSON(
				http.StatusForbidden,
				dto.ErrorResponse{
					Error: "You don't have permission to edit/remove roles",
				},
			)
			return
		}
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Update failed"},
		)
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionUpdateUserRole,
			Target:   id,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "role updated successfully!",
	})
}

// DeleteUser performs a soft delete on a user record
// @Summary Delete User
// @Description Mark a user as deleted by ID
// @Tags Users
// @Param id path string true "User ID (UUID)"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/users/{id} [delete]
func (h *UserHandler) DeleteUser(c *gin.Context) {
	if !middleware.HasPermission(c, "Delete user") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		log.Printf("[DeleteUser] UUID Parse: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid ID Format"},
		)
		return
	}

	actorIDStr := c.GetString("user_id")
	actorID, _ := uuid.Parse(actorIDStr)
	ctx := c.Request.Context()
	actorName, _ := h.LogService.GetUserEmail(ctx, actorID[:])
	if actorName == "" {
		actorName = actorIDStr
	}

	metadata := buildMetadata(map[string]interface{}{
		"target_id":  id,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	err = h.Service.DeleteUser(ctx, userID)
	if err != nil {
		log.Printf("[DeleteUser] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionDeleteUser,
				Target: id,
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"target_id":  id,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Deletion Failed"},
		)
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionDeleteUser,
			Target:   id,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "User deleted successfully",
	})
}
