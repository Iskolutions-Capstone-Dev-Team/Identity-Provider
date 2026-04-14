package v1

import (
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const actionSendInvitation = "send_invitation"

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
// @Router /mail/otp [post]
func (h *MailHandler) SendOTP(c *gin.Context) {
	var req dto.OTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	reqCtx := c.Request.Context()
	err := h.OTPService.SendOTP(reqCtx, req.Email)

	logReq := &dto.PostAuditLogRequest{
		Action: "send_otp",
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
// @Router /mail/invitation [post]
func (h *MailHandler) SendInvitation(c *gin.Context) {
	var req dto.InvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	reqCtx := c.Request.Context()
	err := h.MailService.SendAndSaveInvitation(reqCtx,
		req.Email, req.AccountTypeID)

	actorIDStr := c.GetString("user_id")
	actorID, _ := uuid.Parse(actorIDStr)
	actorName, _ := h.LogService.GetUserEmail(reqCtx, actorID[:])
	if actorName == "" {
		actorName = actorIDStr
	}

	logReq := &dto.PostAuditLogRequest{
		Action: actionSendInvitation,
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
		_ = h.LogService.PostAuditLogWithActorString(reqCtx, actorName, logReq)
		_ = h.LogService.PostSecurityLog(reqCtx, actorID[:], logReq)

		c.JSON(http.StatusInternalServerError,
			dto.ErrorResponse{Error: err.Error()})
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(reqCtx, actorName, logReq)
	_ = h.LogService.PostSecurityLog(reqCtx, actorID[:], logReq)

	c.JSON(http.StatusOK,
		dto.SuccessResponse{Message: "Invitation sent successfully"})
}
