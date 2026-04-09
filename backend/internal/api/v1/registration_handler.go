package v1

import (
	"fmt"
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
// @Router /api/v1/admin/registration/config [get]
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

// GetClientsByAccountTypeID returns all clients for a specific account type.
// @Summary Get Clients By Account Type ID
// @Description Fetch all clients preapproved for a given account type.
// @Tags Registration
// @Param id path int true "Account Type ID"
// @Produce json
// @Success 200 {object} dto.AccountTypeConfigResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/admin/registration/config/{id} [get]
func (h *RegistrationHandler) GetClientsByAccountTypeID(c *gin.Context) {
	idStr := c.Param("id")
	var id int
	if _, err := fmt.Sscanf(idStr, "%d", &id); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid account type id",
		})
		return
	}

	config, err := h.Service.GetClientsByAccountTypeID(c.Request.Context(), id)
	if err != nil {
		log.Printf("[GetClientsByAccountTypeID] %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to fetch clients for account type",
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

// ActivateAccount handles user account activation via invitation code.
// @Summary Activate Account
// @Description Set a password for an account using an invitation code.
// @Tags Registration
// @Accept json
// @Produce json
// @Param req body dto.ActivateAccountRequest true "Activation Request"
// @Success 200 {object} map[string]string
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/activate [post]
func (h *RegistrationHandler) ActivateAccount(c *gin.Context) {
	var req dto.ActivateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid request format",
		})
		return
	}

	err := h.Service.ActivateAccount(c.Request.Context(), req)
	if err != nil {
		log.Printf("[ActivateAccount] %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to activate account",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "account activated successfully",
	})
}

// CheckInvitation checks if an invitation code is valid and not expired.
// @Summary Check Invitation
// @Description Validate if an invitation code exists and is within 24h.
// @Tags Registration
// @Produce json
// @Param code path string true "Invitation Code"
// @Success 200 {object} dto.SuccessResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/activate/{code} [get]
func (h *RegistrationHandler) CheckInvitation(c *gin.Context) {
	code := c.Param("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invitation code is required",
		})
		return
	}

	valid, err := h.Service.CheckInvitation(c.Request.Context(), code)
	if err != nil {
		log.Printf("[CheckInvitation] %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to validate invitation code",
		})
		return
	}

	if !valid {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "invitation code is invalid or expired",
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "invitation code is valid",
	})
}
