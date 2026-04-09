package v1

import (
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
)

type OTPHandler struct {
	OTPService service.OTPService
}

// SendOTP is a handler to generate and send an OTP code to a user's email.
// @Summary Send OTP Code
// @Description Generates a 6-digit numeric OTP and sends it via email.
// @Tags otp
// @Accept json
// @Produce json
// @Param request body dto.OTPRequest true "OTP Request"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/otp/send [post]
func (h *OTPHandler) SendOTP(c *gin.Context) {
	var req dto.OTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	err := h.OTPService.SendOTP(c.Request.Context(), req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, 
			dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Message: "OTP sent successfully"})
}

// VerifyOTP is a handler to verify an OTP code.
// @Summary Verify OTP Code
// @Description Verifies a 6-digit numeric OTP for a user.
// @Tags otp
// @Accept json
// @Produce json
// @Param request body dto.VerifyOTPRequest true "Verify OTP Request"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/v1/otp/verify [post]
func (h *OTPHandler) VerifyOTP(c *gin.Context) {
	var req dto.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	err := h.OTPService.VerifyOTP(c.Request.Context(), req.Email, req.OTP)
	if err != nil {
		c.JSON(http.StatusUnauthorized, 
			dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, 
		dto.SuccessResponse{Message: "OTP verified successfully"})
}

func NewOTPHandler(os service.OTPService) *OTPHandler {
	return &OTPHandler{OTPService: os}
}
