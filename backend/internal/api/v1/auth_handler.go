package v1

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Action constants for audit logging
const (
	actionAuthorize     = "authorize"
	actionLogin         = "login"
	actionLogout        = "logout"
	actionSessionCheck  = "session_check"
	actionJWKS          = "jwks"
	actionTokenExchange = "token_exchange"
	actionTokenRotate   = "token_rotate"
)

// AuthHandler handles authentication HTTP requests.
type AuthHandler struct {
	AuthService *service.AuthService
	LogService  *service.LogService
}

// buildMetadata is a helper to create json.RawMessage from a map.
func buildMetadata(data map[string]interface{}) json.RawMessage {
	b, _ := json.Marshal(data)
	return b
}

// GetAuthorize initiates the authorization flow for the user.
// @Summary Authorize user
// @Description Validates the authorization request for the user.
// @Tags Authentication
// @Success 302
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /auth/authorize [get]
func (h *AuthHandler) Authorize(c *gin.Context) {
	loginUI := os.Getenv("CLIENT_BASE_URL")
	clientID := c.Query("client_id")
	redirectURI := c.Query("redirect_uri")
	loginLink := loginUI + "/login?client_id=" + clientID

	// Resolve client name for audit logging
	clientName := h.LogService.ResolveClientName(clientID)

	// Prepare metadata with IP and User-Agent
	metadata := buildMetadata(map[string]interface{}{
		"client_id":    clientID,
		"client_name":  clientName,
		"redirect_uri": redirectURI,
		"ip":           c.ClientIP(),
		"user_agent":   c.Request.UserAgent(),
	})

	if clientID == "" {
		log.Print("[Authorize] Parameter Extraction: no client_id")
		// Log failure with no actor
		_ = h.LogService.PostAuditLogWithActorString("",
			&dto.PostAuditLogRequest{
				Action:   actionAuthorize,
				Target:   loginUI,
				Status:   models.StatusFail,
				Metadata: metadata,
			})
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "no client id given",
		})
		return
	}

	// Extract session from cookie
	sessionToken, err := c.Cookie(service.SESSION_COOKIE_NAME)
	if err != nil {
		log.Print("[Authorize] Cookie Extraction: no session found")
		// Log redirect to login
		_ = h.LogService.PostAuditLogWithActorString("",
			&dto.PostAuditLogRequest{
				Action:   actionAuthorize,
				Target:   loginLink,
				Status:   models.StatusFail,
				Metadata: metadata,
			})
		c.Redirect(http.StatusFound, loginLink)
		return
	}

	redirectURL, err := h.AuthService.Authorize(
		c.Request.Context(),
		clientID,
		sessionToken,
	)
	if err != nil {
		log.Printf("[Authorize] %v", err)

		// Add error to metadata
		metadataWithErr := buildMetadata(map[string]interface{}{
			"client_id":    clientID,
			"client_name":  clientName,
			"redirect_uri": redirectURI,
			"ip":           c.ClientIP(),
			"user_agent":   c.Request.UserAgent(),
			"error":        err.Error(),
		})
		_ = h.LogService.PostAuditLogWithActorString(sessionToken,
			&dto.PostAuditLogRequest{
				Action:   actionAuthorize,
				Target:   loginUI,
				Status:   models.StatusFail,
				Metadata: metadataWithErr,
			})

		// If session is invalid, send to login
		if strings.Contains(err.Error(), "session invalid") {
			c.Redirect(http.StatusFound, loginUI)
			return
		}

		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "authorization failed",
		})
		return
	}

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(sessionToken,
		&dto.PostAuditLogRequest{
			Action:   actionAuthorize,
			Target:   loginUI,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.Redirect(http.StatusFound, redirectURL)
}

// LoginAndAuthorize verifies credentials and issues an authorization code
// @Summary Login and Authorize
// @Description Authenticate user and return a redirect URL with auth code
// @Tags Authentication
// @Accept json
// @Produce json
// @Param login body dto.LoginRequest true "Login Credentials"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/auth/login [post]
func (h *AuthHandler) LoginAndAuthorize(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[LoginAndAuthorize] Bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request format",
		})
		return
	}

	// Resolve client name
	clientName := h.LogService.ResolveClientName(req.ClientID)

	// Prepare metadata
	metadata := buildMetadata(map[string]interface{}{
		"client_id":   req.ClientID,
		"client_name": clientName,
		"ip":          c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
	})

	redirectLink, sessionID, err := h.AuthService.LoginAndAuthorize(
		c.Request.Context(),
		req,
		c.ClientIP(),
		c.Request.UserAgent(),
	)
	if err != nil {
		log.Printf("[LoginAndAuthorize] %v", err)

		// Add error to metadata
		metadataWithErr := buildMetadata(map[string]interface{}{
			"client_id":   req.ClientID,
			"client_name": clientName,
			"ip":          c.ClientIP(),
			"user_agent":  c.Request.UserAgent(),
			"error":       err.Error(),
		})
		// Log failure with attempted email as actor
		_ = h.LogService.PostAuditLogWithActorString(req.Email,
			&dto.PostAuditLogRequest{
				Action:   actionLogin,
				Target:   req.ClientID,
				Status:   models.StatusFail,
				Metadata: metadataWithErr,
			})

		status := http.StatusInternalServerError
		msg := "internal error"

		if strings.Contains(err.Error(), "Verification") ||
			strings.Contains(err.Error(), "UserLookup") {
			status = http.StatusUnauthorized
			msg = "invalid credentials"
		} else if strings.Contains(err.Error(), "Validation") {
			status = http.StatusForbidden
			msg = "unauthorized redirect uri"
		}

		c.JSON(status, dto.ErrorResponse{Error: msg})
		return
	}

	// Log success with the email that just logged in
	_ = h.LogService.PostAuditLogWithActorString(req.Email,
		&dto.PostAuditLogRequest{
			Action:   actionLogin,
			Target:   req.ClientID,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	// Set session cookie
	maxAge := int(time.Hour.Seconds() * 24 * service.SESSION_DAYS)
	c.SetCookie(
		service.SESSION_COOKIE_NAME,
		sessionID,
		maxAge,
		"/",
		"",
		true,
		true,
	)

	c.JSON(http.StatusOK, redirectLink)
}

// Logout terminates the user session and revokes all tokens
// @Summary Global Logout
// @Description Clear session cookie and revoke all issued tokens for the user
// @Tags Authentication
// @Produce json
// @Success 200 {object} dto.SuccessResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	sessionID, err := c.Cookie(service.SESSION_COOKIE_NAME)
	if err != nil {
		c.JSON(http.StatusOK, dto.SuccessResponse{
			Message: "already logged out",
		})
		return
	}

	// First get the session to know the user ID for audit logging
	session, err := h.AuthService.ValidateSession(
		c.Request.Context(),
		sessionID,
	)
	if err != nil {
		log.Printf("[Logout] ValidateSession: %v", err)
		// Log failure with session ID as actor
		_ = h.LogService.PostAuditLogWithActorString(sessionID,
			&dto.PostAuditLogRequest{
				Action: actionLogout,
				Target: "global",
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		// Even if session not found, clear cookie
		c.SetCookie(
			service.SESSION_COOKIE_NAME,
			"",
			-1,
			"/",
			"",
			true,
			true,
		)
		c.JSON(http.StatusOK, dto.SuccessResponse{
			Message: "session cleared",
		})
		return
	}

	// Perform logout
	err = h.AuthService.Logout(c.Request.Context(), sessionID)
	if err != nil {
		log.Printf("[Logout] %v", err)
		_ = h.LogService.PostAuditLog(session.UserId,
			&dto.PostAuditLogRequest{
				Action: actionLogout,
				Target: "global",
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "logout failed",
		})
		return
	}

	// Log success (resolve user email for better readability)
	userEmail, _ := h.LogService.GetUserEmail(session.UserId)
	actorName := userEmail
	if actorName == "" {
		// fallback to UUID string
		uID, _ := uuid.FromBytes(session.UserId)
		actorName = uID.String()
	}
	_ = h.LogService.PostAuditLogWithActorString(actorName,
		&dto.PostAuditLogRequest{
			Action: actionLogout,
			Target: "global",
			Status: models.StatusSuccess,
			Metadata: buildMetadata(map[string]interface{}{
				"ip":         c.ClientIP(),
				"user_agent": c.Request.UserAgent(),
			}),
		})

	// Clear the session cookie
	c.SetCookie(
		service.SESSION_COOKIE_NAME,
		"",
		-1,
		"/",
		"",
		true,
		true,
	)

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "global logout successful",
	})
}

// CheckSession verifies if the current session cookie is valid
// @Summary Check Session
// @Description Validate the idp_session cookie against the database
// @Tags Authentication
// @Produce json
// @Success 200 {object} dto.SuccessResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/v1/auth/session [get]
func (h *AuthHandler) CheckSession(c *gin.Context) {
	sessionID, err := c.Cookie(service.SESSION_COOKIE_NAME)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false})
		return
	}

	session, err := h.AuthService.ValidateSession(
		c.Request.Context(),
		sessionID,
	)
	if err != nil {
		log.Printf("[CheckSession] %v", err)
		// Log failure with session ID as actor
		_ = h.LogService.PostAuditLogWithActorString(sessionID,
			&dto.PostAuditLogRequest{
				Action: actionSessionCheck,
				Target: "session",
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false})
		return
	}

	// Log success with user email if possible
	userEmail, _ := h.LogService.GetUserEmail(session.UserId)
	actorName := userEmail
	if actorName == "" {
		uID, _ := uuid.FromBytes(session.UserId)
		actorName = uID.String()
	}
	_ = h.LogService.PostAuditLogWithActorString(actorName,
		&dto.PostAuditLogRequest{
			Action: actionSessionCheck,
			Target: "session",
			Status: models.StatusSuccess,
			Metadata: buildMetadata(map[string]interface{}{
				"ip":         c.ClientIP(),
				"user_agent": c.Request.UserAgent(),
			}),
		})

	uID, _ := uuid.FromBytes(session.UserId)
	c.JSON(http.StatusOK, gin.H{
		"authenticated": true,
		"user_id":       uID.String(),
	})
}

// GetJWKS handles the retrieval of public keys for token verification
func (h *AuthHandler) GetJWKS(c *gin.Context) {
	jwks, err := h.AuthService.GetJWKS(c.Request.Context())
	if err != nil {
		log.Printf("[GetJWKS] Key Transformation: %v", err)
		_ = h.LogService.PostAuditLogWithActorString("",
			&dto.PostAuditLogRequest{
				Action: actionJWKS,
				Target: "public_keys",
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "failed to generate jwks"},
		)
		return
	}

	// Log success
	_ = h.LogService.PostAuditLogWithActorString("",
		&dto.PostAuditLogRequest{
			Action:   actionJWKS,
			Target:   "public_keys",
			Status:   models.StatusSuccess,
			Metadata: buildMetadata(map[string]interface{}{
				"ip":         c.ClientIP(),
				"user_agent": c.Request.UserAgent(),
			}),
		})

	c.JSON(http.StatusOK, jwks)
}

// PostTokenExchange handles the exchange of an auth code for access tokens
// @Summary Exchange Auth Code
// @Description Validates the code and client secret to issue JWT and Refresh
// @Tags Authentication
// @Accept json
// @Produce json
// @Param req body dto.TokenExchangeRequest true "Exchange Request"
// @Success 200 {object} dto.TokenResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/auth/token [post]
func (h *AuthHandler) PostTokenExchange(c *gin.Context) {
	var req dto.TokenExchangeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PostTokenExchange] Bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid_request",
		})
		return
	}

	// Resolve client name
	clientName := h.LogService.ResolveClientName(req.ClientID)

	metadata := buildMetadata(map[string]interface{}{
		"client_id":   req.ClientID,
		"client_name": clientName,
		"ip":          c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
	})

	resp, err := h.AuthService.ExchangeCodeForToken(
		c.Request.Context(),
		req,
	)
	if err != nil {
		log.Printf("[PostTokenExchange] %v", err)

		metadataWithErr := buildMetadata(map[string]interface{}{
			"client_id":   req.ClientID,
			"client_name": clientName,
			"ip":          c.ClientIP(),
			"user_agent":  c.Request.UserAgent(),
			"error":       err.Error(),
		})
		// Log failure with client name as actor
		_ = h.LogService.PostAuditLogWithActorString(clientName,
			&dto.PostAuditLogRequest{
				Action:   actionTokenExchange,
				Target:   req.ClientID,
				Status:   models.StatusFail,
				Metadata: metadataWithErr,
			})

		status := http.StatusInternalServerError
		errorMsg := "server_error"

		if strings.Contains(err.Error(), "Verification") {
			status, errorMsg = http.StatusUnauthorized, "unauthorized"
		} else if strings.Contains(err.Error(), "Code Exchange") {
			status, errorMsg = http.StatusBadRequest, "invalid_grant"
		} else if strings.Contains(err.Error(), "UUID Parse") {
			status, errorMsg = http.StatusBadRequest, "invalid_client"
		}

		c.JSON(status, dto.ErrorResponse{Error: errorMsg})
		return
	}

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(clientName,
		&dto.PostAuditLogRequest{
			Action:   actionTokenExchange,
			Target:   req.ClientID,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	sessionID, err := c.Cookie(service.SESSION_COOKIE_NAME)
	if err != nil {
		log.Print("[PostTokenExchange] No session found.")
	}

	maxAge := int(time.Hour.Seconds() * 24 * service.SESSION_DAYS)
	c.SetCookie(
		service.SESSION_COOKIE_NAME,
		sessionID,
		maxAge,
		"/",
		"",
		true,
		true,
	)

	c.JSON(http.StatusOK, resp)
}

// PostTokenRotate handles refreshing an access token using a refresh token
// @Summary Rotate Refresh Token
// @Description Invalidates old refresh token and issues a new pair
// @Tags Authentication
// @Accept json
// @Produce json
// @Param req body dto.RefreshRequest true "Refresh Request"
// @Success 200 {object} dto.TokenResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/auth/refresh [post]
func (h *AuthHandler) PostTokenRotate(c *gin.Context) {
	var req dto.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PostTokenRotate] Bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid_request",
		})
		return
	}

	// For refresh, we don't have a clear actor; use refresh token hint in metadata
	metadata := buildMetadata(map[string]interface{}{
		"refresh_token_hint": req.RefreshToken[:min(8, len(req.RefreshToken))],
		"ip":                  c.ClientIP(),
		"user_agent":          c.Request.UserAgent(),
	})

	resp, err := h.AuthService.RotateRefreshToken(
		c.Request.Context(),
		req.RefreshToken,
	)
	if err != nil {
		log.Printf("[PostTokenRotate] %v", err)

		metadataWithErr := buildMetadata(map[string]interface{}{
			"refresh_token_hint": req.RefreshToken[:min(8, len(req.RefreshToken))],
			"ip":                  c.ClientIP(),
			"user_agent":          c.Request.UserAgent(),
			"error":               err.Error(),
		})
		_ = h.LogService.PostAuditLogWithActorString("",
			&dto.PostAuditLogRequest{
				Action:   actionTokenRotate,
				Target:   "refresh_token",
				Status:   models.StatusFail,
				Metadata: metadataWithErr,
			})

		status := http.StatusInternalServerError
		errorMsg := "server_error"

		if strings.Contains(err.Error(), "TokenLookup") {
			status, errorMsg = http.StatusUnauthorized, "invalid_token"
		} else if strings.Contains(err.Error(), "RotateToken") {
			status, errorMsg = http.StatusInternalServerError, "rotate_fail"
		}

		c.JSON(status, dto.ErrorResponse{Error: errorMsg})
		return
	}

	// Log success
	_ = h.LogService.PostAuditLogWithActorString("",
		&dto.PostAuditLogRequest{
			Action:   actionTokenRotate,
			Target:   "refresh_token",
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, resp)
}
