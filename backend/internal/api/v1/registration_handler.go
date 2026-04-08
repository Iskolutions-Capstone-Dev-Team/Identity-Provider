package v1

import (
	"log"
	"net/http"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
)

type RegistrationHandler struct {
	Service    service.RegistrationService
	LogService service.LogService
}

// GetRegistrationConfig returns reg config and top 5 clients per type.
// @Summary Get Registration Config
// @Description Fetch account types and their top 5 preapproved clients.
// @Tags Registration
// @Produce json
// @Success 200 {object} dto.RegistrationConfigResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/registration/config [get]
func (h *RegistrationHandler) GetRegistrationConfig(c *gin.Context) {
	config, err := h.Service.GetRegistrationConfig(c.Request.Context())
	if err != nil {
		log.Printf("[GetRegistrationConfig] %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to fetch registration config",
		})
		return
	}
	c.JSON(http.StatusOK, config)
}

// UpdatePreapprovedClients updates the preapproved clients list for a specific account type.
// @Summary Update Preapproved Clients
// @Description Add/Remove client IDs for a specific account type.
// @Tags Registration
// @Accept json
// @Produce json
// @Param req body dto.UpdatePreapprovedClientsRequest true "Update Request"
// @Success 200 {object} map[string]string
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/admin/registration/preapproved [put]
func (h *RegistrationHandler) UpdatePreapprovedClients(c *gin.Context) {
	var req dto.UpdatePreapprovedClientsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid request format",
		})
		return
	}

	err := h.Service.UpdatePreapprovedClients(c.Request.Context(), req)
	if err != nil {
		log.Printf("[UpdatePreapprovedClients] %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to update preapproved clients",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Preapproved clients updated successfully"})
}
