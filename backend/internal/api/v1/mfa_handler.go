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
	MFAService  service.MFAService
	UserService service.UserService
	AuthService service.AuthService
}

// GetTOTPSetup returns the secret and URI for a new TOTP authenticator.
func (h *MFAHandler) GetTOTPSetup(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		log.Printf("[GetTOTPSetup] Missing email parameter")
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Email parameter is required",
		})
		return
	}

	user, err := h.UserService.GetUserByEmail(c.Request.Context(), email)
	if err != nil {
		log.Printf("[GetTOTPSetup] User Lookup: %v", err)
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "User not found",
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

	uID, isPending, clearCookie, err := h.AuthService.
		CheckSessionOrPendingMFA(c)
	if err != nil {
		log.Printf("[PostAuthenticator] Auth check failed: %v", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized access",
		})
		return
	}

	user, err := h.UserService.GetUserByEmail(
		c.Request.Context(), req.Email,
	)
	if err != nil {
		log.Printf("[PostAuthenticator] User Lookup: %v", err)
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "User not found",
		})
		return
	}

	userID, _ := uuid.Parse(user.ID)
	if userID != uID {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "User mismatch",
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

	if isPending {
		err := h.AuthService.CreateSessionAndSetCookie(c, uID)
		if err != nil {
			log.Printf("[PostAuthenticator] CreateSession: %v", err)
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: "Failed to establish session",
			})
			return
		}
		clearCookie()
	}

	// We return the URI again just in case, plus backup codes
	issuer := "Identity-Provider"
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

	uID, isPending, clearCookie, err := h.AuthService.
		CheckSessionOrPendingMFA(c)
	if err != nil {
		log.Printf("[PostVerifyMFA] Auth check failed: %v", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized access",
		})
		return
	}

	user, err := h.UserService.GetUserByEmail(
		c.Request.Context(), req.Email,
	)
	if err != nil {
		log.Printf("[PostVerifyMFA] User Lookup: %v", err)
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "User not found",
		})
		return
	}

	userID, _ := uuid.Parse(user.ID)
	if userID != uID {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "User mismatch",
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

	if isPending {
		err := h.AuthService.CreateSessionAndSetCookie(c, uID)
		if err != nil {
			log.Printf("[PostVerifyMFA] CreateSession: %v", err)
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: "Failed to establish session",
			})
			return
		}
		clearCookie()
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "MFA verified successfully",
	})
}

// GetAuthenticatorList returns the list of registered authenticators.
func (h *MFAHandler) GetAuthenticatorList(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		log.Printf("[GetAuthenticatorList] Missing email parameter")
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Email parameter is required",
		})
		return
	}

	user, err := h.UserService.GetUserByEmail(c.Request.Context(), email)
	if err != nil {
		log.Printf("[GetAuthenticatorList] User Lookup: %v", err)
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "User not found",
		})
		return
	}

	userID, _ := uuid.Parse(user.ID)
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
	var req dto.MFADeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[DeleteAuthenticator] Bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request payload",
		})
		return
	}

	id, err := uuid.Parse(req.ID)
	if err != nil {
		log.Printf("[DeleteAuthenticator] ID Parse: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid authenticator ID",
		})
		return
	}

	user, err := h.UserService.GetUserByEmail(c.Request.Context(), req.Email)
	if err != nil {
		log.Printf("[DeleteAuthenticator] User Lookup: %v", err)
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "User not found",
		})
		return
	}

	userID, _ := uuid.Parse(user.ID)
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

/**
 * GetHasTOTP checks whether the user identified by the email query
 * parameter has at least one registered TOTP authenticator.
 * Returns {"has_totp": true|false}.
 */
func (h *MFAHandler) GetHasTOTP(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		log.Printf("[GetHasTOTP] Missing email parameter")
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "email query parameter is required",
		})
		return
	}

	user, err := h.UserService.GetUserByEmail(c.Request.Context(), email)
	if err != nil {
		log.Printf("[GetHasTOTP] User Lookup: %v", err)
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "User not found",
		})
		return
	}

	userID, _ := uuid.Parse(user.ID)
	has, err := h.MFAService.HasTOTP(c.Request.Context(), userID[:])
	if err != nil {
		log.Printf("[GetHasTOTP] HasTOTP: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to check TOTP status",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"has_totp": has})
}

func NewMFAHandler(mfaService service.MFAService,
	userService service.UserService,
	authService service.AuthService,
) *MFAHandler {
	return &MFAHandler{
		MFAService:  mfaService,
		UserService: userService,
		AuthService: authService,
	}
}
