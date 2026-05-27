package v1

import (
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
)

// PasskeyHandler handles WebAuthn passkey registration and verification.
type PasskeyHandler struct {
	PasskeyService service.PasskeyService
}

/**
 * BeginRegistration starts a WebAuthn registration ceremony by returning
 * a challenge JSON blob for the browser's navigator.credentials.create().
 */
func (h *PasskeyHandler) BeginRegistration(c *gin.Context) {
	var req dto.PasskeyBeginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[BeginRegistration] Bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "email is required",
		})
		return
	}

	challenge, err := h.PasskeyService.BeginRegistration(
		c.Request.Context(), req.Email,
	)
	if err != nil {
		log.Printf("[BeginRegistration] Service: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to begin registration",
		})
		return
	}

	c.Data(http.StatusOK, "application/json", challenge)
}

/**
 * FinishRegistration completes the WebAuthn registration ceremony by
 * verifying the attestation and persisting the new credential.
 */
func (h *PasskeyHandler) FinishRegistration(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		log.Printf("[FinishRegistration] Missing email parameter")
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "email query parameter is required",
		})
		return
	}

	if err := h.PasskeyService.FinishRegistration(
		c.Request.Context(), email, c.Request,
	); err != nil {
		log.Printf("[FinishRegistration] Service: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "passkey registration failed",
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Passkey registered successfully",
	})
}

/**
 * BeginVerification starts a WebAuthn authentication ceremony by returning
 * a challenge JSON blob for the browser's navigator.credentials.get().
 */
func (h *PasskeyHandler) BeginVerification(c *gin.Context) {
	var req dto.PasskeyBeginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[BeginVerification] Bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "email is required",
		})
		return
	}

	challenge, err := h.PasskeyService.BeginVerification(
		c.Request.Context(), req.Email,
	)
	if err != nil {
		log.Printf("[BeginVerification] Service: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to begin verification",
		})
		return
	}

	c.Data(http.StatusOK, "application/json", challenge)
}

/**
 * FinishVerification completes the WebAuthn authentication ceremony.
 * Returns 200 on success so the frontend can call finishMfa() and
 * redirect to the OAuth callback — consistent with PostVerifyMFA.
 */
func (h *PasskeyHandler) FinishVerification(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		log.Printf("[FinishVerification] Missing email parameter")
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "email query parameter is required",
		})
		return
	}

	if err := h.PasskeyService.FinishVerification(
		c.Request.Context(), email, c.Request,
	); err != nil {
		log.Printf("[FinishVerification] Service: %v", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "passkey verification failed",
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Passkey verified successfully",
	})
}

// NewPasskeyHandler constructs a PasskeyHandler.
func NewPasskeyHandler(ps service.PasskeyService) *PasskeyHandler {
	return &PasskeyHandler{PasskeyService: ps}
}
