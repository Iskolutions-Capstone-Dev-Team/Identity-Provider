package v1

import (
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
)

type MailHandler struct {
	MailService service.MailService
	LogService  service.LogService
	OTPService  service.OTPService
}

// SendOTP is a handler to generate and send an OTP code to a user's email.
// @Summary Send OTP Code
// @Description Generates a 6-digit numeric OTP and sends it via email.
// @Tags mail
// @Accept json
// @Produce json
// @Param request body dto.OTPRequest true "OTP Request"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/mail/otp [post]
func (h *MailHandler) SendOTP(c *gin.Context) {
	var req dto.OTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	if err := h.OTPService.SendOTP(c.Request.Context(), 
		req.Email); err != nil {
		c.JSON(http.StatusInternalServerError, 
			dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Message: "OTP sent successfully"})
}

// SendInvitation is a handler to send an invitation code.
// @Summary Send Invitation Code
// @Description Generates a secure invitation code and sends it via email.
// @Tags mail
// @Accept json
// @Produce json
// @Param request body dto.InvitationRequest true "Invitation Request"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/mail/invitation [post]
func (h *MailHandler) SendInvitation(c *gin.Context) {
	var req dto.InvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	err := h.MailService.SendAndSaveInvitation(c.Request.Context(), 
		req.Email, models.InvitationType(req.InvitationType))
	if err != nil {
		c.JSON(http.StatusInternalServerError, 
			dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, 
		dto.SuccessResponse{Message: "Invitation sent successfully"})
}
