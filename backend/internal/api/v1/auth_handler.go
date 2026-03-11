package v1

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthHandler struct {
	Service *service.AuthService
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
	loginLink := loginUI + "/login?client_id=" + clientID

	if clientID == "" {
		log.Print("[Authorize] Parameter Extraction: no client_id")
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "no client id given",
		})
		return
	}

	// Extract session from cookie
	token, err := c.Cookie(service.SESSION_COOKIE_NAME)
	if err != nil {
		log.Print("[Authorize] Cookie Extraction: no session found")
		c.Redirect(http.StatusFound, loginLink)
		return
	}
	
	redirectURL, err := h.Service.Authorize(
		c.Request.Context(),
		clientID,
		token,
	)
	if err != nil {
		log.Printf("[Authorize] %v", err)

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

	redirectLink, sessionID, err := h.Service.LoginAndAuthorize(
		c.Request.Context(),
		req,
		c.ClientIP(),
		c.Request.UserAgent(),
	)
	if err != nil {
		log.Printf("[LoginAndAuthorize] %v", err)
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

	c.Redirect(http.StatusFound, redirectLink)
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

	err = h.Service.Logout(c.Request.Context(), sessionID)
	if err != nil {
		log.Printf("[Logout] %v", err)

		// If session isn't found in DB, just clear the cookie anyway
		if strings.Contains(err.Error(), "GetSession") {
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

		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "logout failed",
		})
		return
	}

	// Clear the session cookie on successful logout
	c.SetCookie(service.SESSION_COOKIE_NAME, "", -1, "/", "", true, true)

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

	session, err := h.Service.ValidateSession(
		c.Request.Context(),
		sessionID,
	)
	if err != nil {
		// Log specific reason for failure
		log.Printf("[CheckSession] %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false})
		return
	}

	// Format UUID for response if necessary
	uID, _ := uuid.FromBytes(session.UserId)

	c.JSON(http.StatusOK, gin.H{
		"authenticated": true,
		"user_id":       uID.String(),
	})
}

// GetJWKS handles the retrieval of public keys for token verification
func (h *AuthHandler) GetJWKS(c *gin.Context) {
	jwks, err := h.Service.GetJWKS(c.Request.Context())
	if err != nil {
		// Even for simple transformations, follow the logging standard
		log.Printf("[GetJWKS] Key Transformation: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "failed to generate jwks"},
		)
		return
	}

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

	resp, err := h.Service.ExchangeCodeForToken(
		c.Request.Context(),
		req,
	)
	if err != nil {
		log.Printf("[PostTokenExchange] %v", err)

		status := http.StatusInternalServerError
		errorMsg := "server_error"

		// OAuth2 Specific Error Mapping
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

	resp, err := h.Service.RotateRefreshToken(
		c.Request.Context(),
		req.RefreshToken,
	)
	if err != nil {
		log.Printf("[PostTokenRotate] %v", err)

		status := http.StatusInternalServerError
		errorMsg := "server_error"

		// Specific error mapping for refresh failures
		if strings.Contains(err.Error(), "TokenLookup") {
			status, errorMsg = http.StatusUnauthorized, "invalid_token"
		} else if strings.Contains(err.Error(), "RotateToken") {
			status, errorMsg = http.StatusInternalServerError, "rotate_fail"
		}

		c.JSON(status, dto.ErrorResponse{Error: errorMsg})
		return
	}

	c.JSON(http.StatusOK, resp)
}
