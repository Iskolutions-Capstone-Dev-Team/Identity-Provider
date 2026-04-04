package v1

import (
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
)

type PermissionHandler struct {
	Service *service.PermissionService
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
