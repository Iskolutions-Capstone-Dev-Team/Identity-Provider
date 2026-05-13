package v1

import (
	"fmt"
	"log"
	"net/http"
	"net/url"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MFAHandler struct {
	MFAService service.MFAService
	UserService service.UserService
}

// GetTOTPSetup returns the secret and URI for a new TOTP authenticator.
func (h *MFAHandler) GetTOTPSetup(c *gin.Context) {
	uIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(uIDStr)
	if err != nil {
		log.Printf("[GetTOTPSetup] UUID Parse: %v", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized",
		})
		return
	}

	user, err := h.UserService.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		log.Printf("[GetTOTPSetup] User Lookup: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Internal Server Error",
		})
		return
	}

	secret, uri, err := h.MFAService.GenerateTOTPSetup(c.Request.Context(),
		user.Email)
	if err != nil {
		log.Printf("[GetTOTPSetup] Generate Setup: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to generate TOTP setup",
		})
		return
	}

	c.JSON(http.StatusOK, dto.TOTPSetupResponse{
		Secret:     secret,
		OTPAuthURI: uri,
	})
}

// PostAuthenticator verifies and saves a new TOTP authenticator.
func (h *MFAHandler) PostAuthenticator(c *gin.Context) {
	var req dto.TOTPFinalizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PostAuthenticator] Bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request payload",
		})
		return
	}

	uIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(uIDStr)
	if err != nil {
		log.Printf("[PostAuthenticator] UUID Parse: %v", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized",
		})
		return
	}

	backupCodes, err := h.MFAService.FinalizeTOTP(c.Request.Context(),
		userID[:], req.Secret, req.Code, req.Name)
	if err != nil {
		log.Printf("[PostAuthenticator] Finalize TOTP: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	// We return the URI again just in case, plus backup codes
	issuer := "Identity-Provider"
	user, _ := h.UserService.GetUserByID(c.Request.Context(), userID)
	uri := fmt.Sprintf("otpauth://totp/%s:%s?secret=%s&issuer=%s",
		issuer, user.Email, req.Secret, url.QueryEscape(issuer))

	c.JSON(http.StatusOK, dto.MFASetupResponse{
		OTPAuthURI:  uri,
		BackupCodes: backupCodes,
	})
}

// PostVerifyMFA verifies the 6-digit TOTP or backup code.
func (h *MFAHandler) PostVerifyMFA(c *gin.Context) {
	var req dto.MFAVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PostVerifyMFA] Bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request payload",
		})
		return
	}

	uIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(uIDStr)
	if err != nil {
		log.Printf("[PostVerifyMFA] UUID Parse: %v", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized",
		})
		return
	}

	success, err := h.MFAService.VerifyCode(c.Request.Context(),
		userID[:], req.Code)
	if err != nil {
		log.Printf("[PostVerifyMFA] Verify Code: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Verification failed",
		})
		return
	}

	if !success {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Invalid code",
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "MFA verified successfully",
	})
}

// GetAuthenticatorList returns the list of registered authenticators.
func (h *MFAHandler) GetAuthenticatorList(c *gin.Context) {
	uIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(uIDStr)
	if err != nil {
		log.Printf("[GetAuthenticatorList] UUID Parse: %v", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized",
		})
		return
	}

	list, err := h.MFAService.GetAuthenticatorList(c.Request.Context(),
		userID[:])
	if err != nil {
		log.Printf("[GetAuthenticatorList] Fetch List: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to fetch authenticator list",
		})
		return
	}

	c.JSON(http.StatusOK, list)
}

// DeleteAuthenticator removes an authenticator.
func (h *MFAHandler) DeleteAuthenticator(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		log.Printf("[DeleteAuthenticator] ID Parse: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid authenticator ID",
		})
		return
	}

	uIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(uIDStr)
	if err != nil {
		log.Printf("[DeleteAuthenticator] User UUID Parse: %v", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized",
		})
		return
	}

	err = h.MFAService.RemoveAuthenticator(c.Request.Context(), id[:],
		userID[:])
	if err != nil {
		log.Printf("[DeleteAuthenticator] Remove: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to remove authenticator",
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Authenticator removed successfully",
	})
}

func NewMFAHandler(mfaService service.MFAService,
	userService service.UserService,
) *MFAHandler {
	return &MFAHandler{
		MFAService:  mfaService,
		UserService: userService,
	}
}
