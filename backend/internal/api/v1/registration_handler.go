package v1

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	actionPostAccountType   = "post_account_type"
	actionPutAccountType    = "put_account_type"
	actionDeleteAccountType = "delete_account_type"
	actionActivateAccount   = "activate_account"
	actionCheckInvitation   = "check_invitation"
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
// @Router /admin/registration/config [get]
func (h *RegistrationHandler) GetRegistrationConfig(c *gin.Context) {
	if !middleware.HasPermission(c, "View Registration Config") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized",
		})
		return
	}

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
// @Router /admin/registration/config/{id} [get]
func (h *RegistrationHandler) GetClientsByAccountTypeID(c *gin.Context) {
	if !middleware.HasPermission(c, "View Registration Config") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized",
		})
		return
	}

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

// PostAccountType creates a new account type and handles initial config.
// @Summary Create Account Type
// @Description Create an account type with preapproved clients.
// @Tags Registration
// @Accept json
// @Produce json
// @Param req body dto.UpsertAccountTypeRequest true "Create Request"
// @Success 200 {object} map[string]string
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/registration/config [post]
func (h *RegistrationHandler) PostAccountType(c *gin.Context) {
	if !middleware.HasPermission(c, "Create Registration Config") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized",
		})
		return
	}

	var req dto.UpsertAccountTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid request format",
		})
		return
	}

	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(c.Request.Context(), userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	reqCtx := c.Request.Context()
	err := h.Service.CreateAccountType(reqCtx, req)

	logReq := &dto.PostAuditLogRequest{
		Action: actionPostAccountType,
		Target: fmt.Sprintf("account_type_%s", req.Name),
		Status: models.StatusSuccess,
		Metadata: buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
		}),
	}

	if err != nil {
		log.Printf("[PostAccountType] %v", err)
		logReq.Status = models.StatusFail
		logReq.Metadata = buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
			"error":      err.Error(),
		})
		_ = h.LogService.PostAuditLogWithActorString(reqCtx, actorName, logReq)
		_ = h.LogService.PostSecurityLog(reqCtx, userID[:], logReq)

		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to create account type",
		})
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(reqCtx, actorName, logReq)
	_ = h.LogService.PostSecurityLog(reqCtx, userID[:], logReq)

	c.JSON(http.StatusOK, gin.H{"message": "Account type created successfully"})
}

// PutAccountType updates an account type and its preapproved clients.
// @Summary Update Account Type
// @Description Update name and preapproved clients for an account type.
// @Tags Registration
// @Accept json
// @Produce json
// @Param req body dto.UpsertAccountTypeRequest true "Update Request"
// @Success 200 {object} map[string]string
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/registration/config [put]
func (h *RegistrationHandler) PutAccountType(c *gin.Context) {
	if !middleware.HasPermission(c, "Edit Registration Config") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized",
		})
		return
	}

	var req dto.UpsertAccountTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid request format",
		})
		return
	}

	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(c.Request.Context(), userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	reqCtx := c.Request.Context()
	err := h.Service.UpdateAccountType(reqCtx, req)

	logReq := &dto.PostAuditLogRequest{
		Action: actionPutAccountType,
		Target: fmt.Sprintf("account_type_%d", req.ID),
		Status: models.StatusSuccess,
		Metadata: buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
		}),
	}

	if err != nil {
		log.Printf("[PutAccountType] %v", err)
		logReq.Status = models.StatusFail
		logReq.Metadata = buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
			"error":      err.Error(),
		})
		_ = h.LogService.PostAuditLogWithActorString(reqCtx, actorName, logReq)
		_ = h.LogService.PostSecurityLog(reqCtx, userID[:], logReq)

		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to update account type",
		})
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(reqCtx, actorName, logReq)
	_ = h.LogService.PostSecurityLog(reqCtx, userID[:], logReq)

	c.JSON(http.StatusOK, gin.H{"message": "Account type updated successfully"})
}

// DeleteAccountType deletes an account type.
// @Summary Delete Account Type
// @Description Delete an account type and its client associations.
// @Tags Registration
// @Param id path int true "Account Type ID"
// @Produce json
// @Success 200 {object} map[string]string
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/registration/config/{id} [delete]
func (h *RegistrationHandler) DeleteAccountType(c *gin.Context) {
	if !middleware.HasPermission(c, "Delete Registration Config") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized",
		})
		return
	}

	idStr := c.Param("id")
	var id int
	if _, err := fmt.Sscanf(idStr, "%d", &id); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid account type id",
		})
		return
	}

	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(c.Request.Context(), userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	reqCtx := c.Request.Context()
	err := h.Service.DeleteAccountType(reqCtx, id)

	logReq := &dto.PostAuditLogRequest{
		Action: actionDeleteAccountType,
		Target: fmt.Sprintf("account_type_%d", id),
		Status: models.StatusSuccess,
		Metadata: buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
		}),
	}

	if err != nil {
		log.Printf("[DeleteAccountType] %v", err)
		logReq.Status = models.StatusFail
		logReq.Metadata = buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
			"error":      err.Error(),
		})
		_ = h.LogService.PostAuditLogWithActorString(reqCtx, actorName, logReq)
		_ = h.LogService.PostSecurityLog(reqCtx, userID[:], logReq)

		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to delete account type",
		})
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(reqCtx, actorName, logReq)
	_ = h.LogService.PostSecurityLog(reqCtx, userID[:], logReq)

	c.JSON(http.StatusOK, gin.H{"message": "Account type deleted successfully"})
}

// SyncAccountTypeUsers synchronizes clients for all users of an account type.
// @Summary Sync Account Type Users
// @Description Sync clients for all users belonging to a specific account type.
// @Tags Registration
// @Param id path int true "Account Type ID"
// @Produce json
// @Success 202 {object} map[string]string
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/registration/sync/{id} [post]
func (h *RegistrationHandler) SyncAccountTypeUsers(c *gin.Context) {
	if !middleware.HasPermission(c, "Edit Registration Config") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized",
		})
		return
	}

	idStr := c.Param("id")
	var id int
	if _, err := fmt.Sscanf(idStr, "%d", &id); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid account type id",
		})
		return
	}

	// Trigger async sync
	go func() {
		// Use a background context as the request context will be canceled
		ctx := context.Background()
		err := h.Service.SyncUsersByAccountType(ctx, id)
		if err != nil {
			log.Printf("[SyncAccountTypeUsers] Async sync failed: %v", err)
		}
	}()

	c.JSON(http.StatusAccepted, dto.SuccessResponse{
		Message: "Synchronization started in the background",
	})
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
// @Router /activate [post]
func (h *RegistrationHandler) ActivateAccount(c *gin.Context) {
	var req dto.ActivateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid request format",
		})
		return
	}

	reqCtx := c.Request.Context()
	err := h.Service.ActivateAccount(reqCtx, req)

	actor := req.InvitationCode

	logReq := &dto.PostAuditLogRequest{
		Action: actionActivateAccount,
		Target: req.InvitationCode,
		Status: models.StatusSuccess,
		Metadata: buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
		}),
	}

	if err != nil {
		log.Printf("[ActivateAccount] %v", err)
		logReq.Status = models.StatusFail
		logReq.Metadata = buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
			"error":      err.Error(),
		})
		_ = h.LogService.PostAuditLogWithActorString(reqCtx, actor, logReq)
		_ = h.LogService.PostSecurityLogWithActorString(reqCtx, actor, logReq)

		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to activate account",
		})
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(reqCtx, actor, logReq)
	_ = h.LogService.PostSecurityLogWithActorString(reqCtx, actor, logReq)

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
// @Router /activate/{code} [get]
func (h *RegistrationHandler) CheckInvitation(c *gin.Context) {
	code := c.Param("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invitation code is required",
		})
		return
	}

	reqCtx := c.Request.Context()
	valid, err := h.Service.CheckInvitation(reqCtx, code)

	logReq := &dto.PostAuditLogRequest{
		Action: actionCheckInvitation,
		Target: code,
		Status: models.StatusSuccess,
		Metadata: buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
		}),
	}

	if err != nil {
		log.Printf("[CheckInvitation] %v", err)
		logReq.Status = models.StatusFail
		logReq.Metadata = buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
			"error":      err.Error(),
		})
		_ = h.LogService.PostAuditLogWithActorString(reqCtx, code, logReq)
		_ = h.LogService.PostSecurityLogWithActorString(reqCtx, code, logReq)

		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to validate invitation code",
		})
		return
	}

	if !valid {
		logReq.Status = models.StatusFail
		logReq.Metadata = buildMetadata(map[string]interface{}{
			"ip":         c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
			"error":      "invalid or expired",
		})
		_ = h.LogService.PostAuditLogWithActorString(reqCtx, code, logReq)
		_ = h.LogService.PostSecurityLogWithActorString(reqCtx, code, logReq)

		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "invitation code is invalid or expired",
		})
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(reqCtx, code, logReq)
	_ = h.LogService.PostSecurityLogWithActorString(reqCtx, code, logReq)

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "invitation code is valid",
	})
}
