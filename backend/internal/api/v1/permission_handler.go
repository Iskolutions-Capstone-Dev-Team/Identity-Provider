package v1

import (
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PermissionHandler struct {
	Service  service.PermissionService
	UserRepo repository.UserRepository
	RoleRepo repository.RoleRepository
}

/**
 * @Summary Get All Permissions
 * @Description Retrieve a list of all permissions.
 * @Tags Permissions
 * @Accept json
 * @Produce json
 * @Success 200 {array} dto.PermissionResponse
 * @Failure 500 {object} dto.ErrorResponse
 * @Router /permissions [get]
 */
func (h *PermissionHandler) GetAllPermissions(c *gin.Context) {
	permissions, err := h.Service.GetAllPermissions(c.Request.Context())
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Failed to retrieve permissions"},
		)
		return
	}
	c.JSON(http.StatusOK, permissions)
}

/**
 * @Summary Get My Permissions
 * @Description Retrieve a list of all permissions for the currently authenticated user.
 * @Tags Permissions
 * @Accept json
 * @Produce json
 * @Success 200 {object} dto.UserPermissionsResponse
 * @Failure 401 {object} dto.ErrorResponse
 * @Failure 500 {object} dto.ErrorResponse
 * @Security BearerAuth
 * @Router /me/permissions [get]
 */
func (h *PermissionHandler) GetUserPermissions(c *gin.Context) {
	uVal, uExists := c.Get("user_id")
	if !uExists {
		log.Print("[GetUserPermissions] Context Extraction: missing user_id")
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "missing authentication context",
		})
		return
	}

	uID, err := uuid.Parse(uVal.(string))
	if err != nil {
		log.Printf("[GetUserPermissions] UUID Parse Error: %v", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "invalid user context",
		})
		return
	}

	ctx := c.Request.Context()
	user, err := h.UserRepo.GetUserById(ctx, uID[:])
	if err != nil {
		log.Printf("[GetUserPermissions] Fetch user failed: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to retrieve user",
		})
		return
	}

	roleIDs := []int{user.Role.ID}
	permMap, err := h.RoleRepo.FetchPermissionsForRoles(ctx, roleIDs)
	if err != nil {
		log.Printf("[GetUserPermissions] Fetch permissions failed: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to retrieve permissions",
		})
		return
	}

	permissionsSet := make(map[string]bool)
	for _, perms := range permMap {
		for _, p := range perms {
			permissionsSet[p.PermissionName] = true
		}
	}

	permissions := make([]string, 0, len(permissionsSet))
	for p := range permissionsSet {
		permissions = append(permissions, p)
	}

	c.JSON(http.StatusOK, dto.UserPermissionsResponse{
		Permissions: permissions,
	})
}
