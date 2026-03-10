package v1

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UserHandler struct {
	Service    *service.UserService
	Repo       *repository.UserRepository
	ClientRepo *repository.ClientRepository
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
	var req dto.UserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PostUser] Bind JSON: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "invalid request payload"},
		)
		return
	}

	userID, err := h.Service.CreateUser(c.Request.Context(), req)
	if err != nil {
		log.Printf("[PostUser] %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "failed to create user"},
		)
		return
	}

	message := fmt.Sprintf("Created user with the id %s", userID)
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
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}

	// Constants are used for global configuration values
	resp, err := h.Service.GetUserList(
		c.Request.Context(),
		service.PAGE_LIMIT,
		page,
	)
	if err != nil {
		log.Printf("[GetUserList] %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "failed to retrieve user list"},
		)
		return
	}

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

	resp, err := h.Service.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		log.Printf("[GetUser] %v", err)
		c.JSON(
			http.StatusNotFound,
			dto.ErrorResponse{Error: "User not found"},
		)
		return
	}

	c.JSON(http.StatusOK, resp)
}

// GetMe retrieves user information based on the access token bearer auth
// @Summary      Get authenticated user info
// @Description  Returns user profile filtered by client allowed roles
// @Tags         User
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

	resp, err := h.Service.GetMe(c.Request.Context(), uID, cID)
	if err != nil {
		log.Printf("[GetMe] %v", err)
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "user information not found",
		})
		return
	}

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

	var req dto.UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PatchUserPassword] Bind JSON: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "invalid request body"},
		)
		return
	}

	err = h.Service.UpdateUserPassword(
		c.Request.Context(),
		userID,
		req.NewPassword,
	)
	if err != nil {
		log.Printf("[PatchUserPassword] %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Update failed"},
		)
		return
	}

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

	var req dto.UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PatchUserStatus] Bind JSON: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid input"},
		)
		return
	}

	err = h.Service.UpdateUserStatus(
		c.Request.Context(),
		userID,
		req.NewStatus,
	)
	if err != nil {
		log.Printf("[PatchUserStatus] %v", err)

		// Differentiate between validation errors and server errors
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

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Status Updated Successfully!",
	})
}

// PatchUserRoles updates the roles assigned to a specific user.
// @Summary Update user roles
// @Description Partially updates a user's role set based on the request body.
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param request body dto.UpdateUserRoleRequest true "Role update data"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /users/{id}/roles [patch]
func (h *UserHandler) PatchUserRoles(c *gin.Context) {
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

	var req dto.UpdateUserRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PatchUserRoles] Bind JSON: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid input"},
		)
		return
	}

	err = h.Service.UpdateUserRoles(
		c.Request.Context(),
		userID,
		req.RoleIDs,
	)
	if err != nil {
		log.Printf("[PatchUserRoles] %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Update failed"},
		)
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "roles updated successfully!",
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

	err = h.Service.DeleteUser(c.Request.Context(), userID)
	if err != nil {
		log.Printf("[DeleteUser] %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Deletion Failed"},
		)
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "User deleted successfully",
	})
}
