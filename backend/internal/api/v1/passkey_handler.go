package v1

import (
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/errors"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// PasskeyHandler handles WebAuthn passkey registration and verification.
type PasskeyHandler struct {
	PasskeyService service.PasskeyService
	UserService    service.UserService
	AuthService    service.AuthService
}

/**
 * BeginRegistration starts a WebAuthn registration ceremony by returning
 * a challenge JSON blob for the browser's navigator.credentials.create().
 */
func (h *PasskeyHandler) BeginRegistration(c *gin.Context) {
	var req dto.PasskeyBeginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[BeginRegistration] Bind JSON: %v", err)
		errors.SendString(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Email parameter is required.",
			"email is required",
		)
		return
	}

	uID, _, _, err := h.AuthService.
		CheckSessionOrPendingMFA(c)
	if err != nil {
		log.Printf("[BeginRegistration] Auth check failed: %v", err)
		errors.Send(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"Unauthorized access.",
			err,
		)
		return
	}

	user, err := h.UserService.GetUserByEmail(
		c.Request.Context(), req.Email,
	)
	if err != nil {
		log.Printf("[BeginRegistration] User Lookup: %v", err)
		errors.Send(
			c,
			http.StatusNotFound,
			errors.CodeNotFound,
			"User not found.",
			err,
		)
		return
	}

	userID, _ := uuid.Parse(user.ID)
	if userID != uID {
		errors.SendString(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"User mismatch.",
			"User mismatch",
		)
		return
	}

	platformAvailable := false
	if req.PlatformAvailable != nil {
		platformAvailable = *req.PlatformAvailable
	}

	challenge, err := h.PasskeyService.BeginRegistration(
		c.Request.Context(),
		req.Email,
		platformAvailable,
		c.Request,
	)
	if err != nil {
		log.Printf("[BeginRegistration] Service: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeMFAFailed,
			"Failed to begin registration.",
			err,
		)
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
		errors.SendString(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Email query parameter is required.",
			"email query parameter is required",
		)
		return
	}

	uID, isPending, clearCookie, err := h.AuthService.
		CheckSessionOrPendingMFA(c)
	if err != nil {
		log.Printf("[FinishRegistration] Auth check failed: %v", err)
		errors.Send(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"Unauthorized access.",
			err,
		)
		return
	}

	user, err := h.UserService.GetUserByEmail(
		c.Request.Context(), email,
	)
	if err != nil {
		log.Printf("[FinishRegistration] User Lookup: %v", err)
		errors.Send(
			c,
			http.StatusNotFound,
			errors.CodeNotFound,
			"User not found.",
			err,
		)
		return
	}

	userID, _ := uuid.Parse(user.ID)
	if userID != uID {
		errors.SendString(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"User mismatch.",
			"User mismatch",
		)
		return
	}

	err = h.PasskeyService.FinishRegistration(
		c.Request.Context(),
		email,
		c.Request,
	)
	if err != nil {
		log.Printf("[FinishRegistration] Service: %v", err)
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeMFAFailed,
			"Passkey registration failed.",
			err,
		)
		return
	}

	if isPending {
		err := h.AuthService.CreateSessionAndSetCookie(c, uID)
		if err != nil {
			log.Printf("[FinishRegistration] CreateSession: %v", err)
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
		errors.SendString(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Email parameter is required.",
			"email is required",
		)
		return
	}

	uID, _, _, err := h.AuthService.
		CheckSessionOrPendingMFA(c)
	if err != nil {
		log.Printf("[BeginVerification] Auth check failed: %v", err)
		errors.Send(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"Unauthorized access.",
			err,
		)
		return
	}

	user, err := h.UserService.GetUserByEmail(
		c.Request.Context(), req.Email,
	)
	if err != nil {
		log.Printf("[BeginVerification] User Lookup: %v", err)
		errors.Send(
			c,
			http.StatusNotFound,
			errors.CodeNotFound,
			"User not found.",
			err,
		)
		return
	}

	userID, _ := uuid.Parse(user.ID)
	if userID != uID {
		errors.SendString(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"User mismatch.",
			"User mismatch",
		)
		return
	}

	platformAvailable := false
	if req.PlatformAvailable != nil {
		platformAvailable = *req.PlatformAvailable
	}

	challenge, err := h.PasskeyService.BeginVerification(
		c.Request.Context(),
		req.Email,
		platformAvailable,
		c.Request,
	)
	if err != nil {
		log.Printf("[BeginVerification] Service: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeMFAFailed,
			"Failed to begin verification.",
			err,
		)
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
		errors.SendString(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Email query parameter is required.",
			"email query parameter is required",
		)
		return
	}

	uID, isPending, clearCookie, err := h.AuthService.
		CheckSessionOrPendingMFA(c)
	if err != nil {
		log.Printf("[FinishVerification] Auth check failed: %v", err)
		errors.Send(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"Unauthorized access.",
			err,
		)
		return
	}

	user, err := h.UserService.GetUserByEmail(
		c.Request.Context(), email,
	)
	if err != nil {
		log.Printf("[FinishVerification] User Lookup: %v", err)
		errors.Send(
			c,
			http.StatusNotFound,
			errors.CodeNotFound,
			"User not found.",
			err,
		)
		return
	}

	userID, _ := uuid.Parse(user.ID)
	if userID != uID {
		errors.SendString(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"User mismatch.",
			"User mismatch",
		)
		return
	}

	err = h.PasskeyService.FinishVerification(
		c.Request.Context(),
		email,
		c.Request,
	)
	if err != nil {
		log.Printf("[FinishVerification] Service: %v", err)
		errors.Send(
			c,
			http.StatusUnauthorized,
			errors.CodeMFAFailed,
			"Passkey verification failed.",
			err,
		)
		return
	}

	if isPending {
		err := h.AuthService.CreateSessionAndSetCookie(c, uID)
		if err != nil {
			log.Printf("[FinishVerification] CreateSession: %v", err)
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

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Passkey verified successfully",
	})
}

/**
 * GetHasPasskey checks whether the user identified by the email query
 * parameter has at least one registered passkey credential.
 * Returns {"has_passkey": true|false}.
 */
func (h *PasskeyHandler) GetHasPasskey(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		log.Printf("[GetHasPasskey] Missing email parameter")
		errors.SendString(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Email query parameter is required.",
			"email query parameter is required",
		)
		return
	}

	uID, _, _, err := h.AuthService.
		CheckSessionOrPendingMFA(c)
	if err != nil {
		log.Printf("[GetHasPasskey] Auth check failed: %v", err)
		errors.Send(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"Unauthorized access.",
			err,
		)
		return
	}

	user, err := h.UserService.GetUserByEmail(
		c.Request.Context(), email,
	)
	if err != nil {
		log.Printf("[GetHasPasskey] User Lookup: %v", err)
		errors.Send(
			c,
			http.StatusNotFound,
			errors.CodeNotFound,
			"User not found.",
			err,
		)
		return
	}

	userID, _ := uuid.Parse(user.ID)
	if userID != uID {
		errors.SendString(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"User mismatch.",
			"User mismatch",
		)
		return
	}

	has, err := h.PasskeyService.HasPasskey(
		c.Request.Context(),
		email,
	)
	if err != nil {
		log.Printf("[GetHasPasskey] HasPasskey: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to check passkey status.",
			err,
		)
		return
	}

	c.JSON(http.StatusOK, gin.H{"has_passkey": has})
}

// NewPasskeyHandler constructs a PasskeyHandler.
func NewPasskeyHandler(
	ps service.PasskeyService,
	us service.UserService,
	as service.AuthService,
) *PasskeyHandler {
	return &PasskeyHandler{
		PasskeyService: ps,
		UserService:    us,
		AuthService:    as,
	}
}
