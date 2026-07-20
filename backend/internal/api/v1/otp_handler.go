package v1

import (
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/errors"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	actionSendOTP   = "send_otp"
	actionVerifyOTP = "verify_otp"
)

type OTPHandler struct {
	OTPService  service.OTPService
	LogService  service.LogService
	UserService service.UserService
	AuthService service.AuthService
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
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid request format.",
			err,
		)
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
		_ = h.LogService.PostSecurityLogWithActorString(
			reqCtx,
			req.Email,
			logReq,
		)

		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeOTPFailed,
			"Failed to send OTP code. Please try again.",
			err,
		)
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
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid request format.",
			err,
		)
		return
	}

	reqCtx := c.Request.Context()

	var tokenStr string
	var isPending bool
	var clearCookie func()
	var uID uuid.UUID
	pendingCookie, errCookie := c.Cookie("idp_mfa_pending")
	if errCookie == nil && pendingCookie != "" {
		tokenStr = pendingCookie
	} else {
		authHeader := c.GetHeader("Authorization")
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			tokenStr = authHeader[7:]
		}
	}

	if tokenStr != "" {
		claims, errVal := h.AuthService.
			ValidateMFAPendingToken(tokenStr)
		if errVal == nil {
			parsedID, errParse := uuid.Parse(claims.UserID)
			if errParse == nil {
				user, errUser := h.UserService.
					GetUserByEmail(reqCtx, req.Email)
				if errUser == nil {
					userID, _ := uuid.Parse(user.ID)
					if userID == parsedID {
						uID = userID
						isPending = true
						clearCookie = func() {
							c.SetSameSite(
								http.SameSiteStrictMode,
							)
							c.SetCookie(
								"idp_mfa_pending",
								"",
								-1,
								"/",
								"",
								true,
								true,
							)
						}
					}
				}
			}
		}
	}

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
		_ = h.LogService.PostAuditLogWithActorString(
			reqCtx, req.Email, logReq,
		)
		_ = h.LogService.PostSecurityLogWithActorString(
			reqCtx, req.Email, logReq,
		)

		errors.Send(
			c,
			http.StatusUnauthorized,
			errors.CodeOTPFailed,
			"The one-time password is incorrect or has expired.",
			err,
		)
		return
	}

	if isPending {
		err := h.AuthService.CreateSessionAndSetCookie(c, uID)
		if err != nil {
			log.Printf("[VerifyOTP] CreateSession: %v", err)
			errors.Send(
				c,
				http.StatusInternalServerError,
				errors.CodeInternalError,
				"Failed to establish session.",
				err,
			)
			return
		}
		clearCookie()
	}

	_ = h.LogService.PostAuditLogWithActorString(reqCtx, req.Email, logReq)
	_ = h.LogService.PostSecurityLogWithActorString(reqCtx, req.Email, logReq)

	c.JSON(http.StatusOK,
		dto.SuccessResponse{Message: "OTP verified successfully"})
}

func NewOTPHandler(
	os service.OTPService,
	ls service.LogService,
	us service.UserService,
	as service.AuthService,
) *OTPHandler {
	return &OTPHandler{
		OTPService:  os,
		LogService:  ls,
		UserService: us,
		AuthService: as,
	}
}
