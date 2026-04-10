package v1

import (
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
)

const (
	actionSendOTP   = "send_otp"
	actionVerifyOTP = "verify_otp"
)

type OTPHandler struct {
	OTPService service.OTPService
	LogService service.LogService
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
// @Router /otp/send [post]
func (h *OTPHandler) SendOTP(c *gin.Context) {
	var req dto.OTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	reqCtx := c.Request.Context()
	err := h.OTPService.SendOTP(reqCtx, req.Email)

	logReq := &dto.PostAuditLogRequest{
		Action: actionSendOTP,
		Target: req.Email,
		Status: models.StatusSuccess,
		Metadata: buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
		}),
	}

	if err != nil {
		logReq.Status = models.StatusFail
		logReq.Metadata = buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
			"error":      err.Error(),
		})
		_ = h.LogService.PostAuditLogWithActorString(reqCtx, req.Email, logReq)
		_ = h.LogService.PostSecurityLogWithActorString(reqCtx, req.Email, logReq)

		c.JSON(http.StatusInternalServerError,
			dto.ErrorResponse{Error: err.Error()})
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(reqCtx, req.Email, logReq)
	_ = h.LogService.PostSecurityLogWithActorString(reqCtx, req.Email, logReq)

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
// @Router /otp/verify [post]
func (h *OTPHandler) VerifyOTP(c *gin.Context) {
	var req dto.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	reqCtx := c.Request.Context()
	err := h.OTPService.VerifyOTP(reqCtx, req.Email, req.OTP)

	logReq := &dto.PostAuditLogRequest{
		Action: actionVerifyOTP,
		Target: req.Email,
		Status: models.StatusSuccess,
		Metadata: buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
		}),
	}

	if err != nil {
		logReq.Status = models.StatusFail
		logReq.Metadata = buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
			"error":      err.Error(),
		})
		_ = h.LogService.PostAuditLogWithActorString(reqCtx, req.Email, logReq)
		_ = h.LogService.PostSecurityLogWithActorString(reqCtx, req.Email, logReq)

		c.JSON(http.StatusUnauthorized,
			dto.ErrorResponse{Error: err.Error()})
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(reqCtx, req.Email, logReq)
	_ = h.LogService.PostSecurityLogWithActorString(reqCtx, req.Email, logReq)

	c.JSON(http.StatusOK,
		dto.SuccessResponse{Message: "OTP verified successfully"})
}

func NewOTPHandler(os service.OTPService, ls service.LogService) *OTPHandler {
	return &OTPHandler{OTPService: os, LogService: ls}
}
