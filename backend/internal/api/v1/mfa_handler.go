package v1

import (
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MFAHandler struct {
	MFAService service.MFAService
	UserService service.UserService
}

// PostAuthenticator initiates TOTP setup for the user.
func (h *MFAHandler) PostAuthenticator(c *gin.Context) {
	uIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(uIDStr)
	if err != nil {
		log.Printf("[PostAuthenticator] UUID Parse: %v", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized",
		})
		return
	}

	user, err := h.UserService.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		log.Printf("[PostAuthenticator] User Lookup: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Internal Server Error",
		})
		return
	}

	uri, backupCodes, err := h.MFAService.SetupTOTP(c.Request.Context(),
		userID[:], user.Email)
	if err != nil {
		log.Printf("[PostAuthenticator] Setup TOTP: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to setup TOTP",
		})
		return
	}

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
