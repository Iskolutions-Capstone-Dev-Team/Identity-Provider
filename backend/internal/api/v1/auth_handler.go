package v1

import (
	"crypto/rsa"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthHandler struct {
	Repo        *repository.AuthCodeRepository
	SessionRepo *repository.SessionRepository
	ClientRepo  *repository.ClientRepository
	PrivateKey  *rsa.PrivateKey
	PublicKey   *rsa.PublicKey
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
	loginUIPath := os.Getenv("LOGIN_UI_PATH")
	clientID := c.Query("client_id")
	if clientID == "" {
		log.Print("[Authorize] No client_id given")
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "no client id given"},
		)
	}

	clientIDBytes, err := uuid.Parse(clientID)
	if err != nil {
		log.Printf("[Authorize] failed to parse client id: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "parse failed"},
		)
		return
	}

	accessTokenString, err := c.Cookie(ACCESS_TOKEN_NAME)
	if err != nil {
		log.Print("[Authorize] No cookie found, redirecting to login")
		c.Redirect(http.StatusFound, loginUIPath)
		return
	}

	isValid, err := service.ValidateToken(accessTokenString, h.PublicKey)
	if !isValid || err != nil {
		log.Printf("[Authorize] Validation Error: %v", err)
		c.Redirect(http.StatusFound, loginUIPath)
		return
	}

	code, err := utils.GenerateAuthorizationCode()
	if err != nil {
		log.Printf("[LoginAndAuthorize] Code Generation Error: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "internal error"},
		)
		return
	}

	client, err := h.ClientRepo.GetByID(clientIDBytes[:])
	if err != nil {
		log.Printf("[Authorize] client with id %s not found: %v", clientID, err)
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "id not found"})
		return
	}

	log.Print("[Authorize] Token found, redirecting...")
	redirectURL := fmt.Sprintf("%s?code=%s", client.RedirectUri, code)
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
		log.Printf("[LoginAndAuthorize] Bind JSON Error: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid request format"},
		)
		return
	}

	claims, storedHash, err := h.Repo.GetUserForAuth(req.Email)
	if err != nil {
		log.Printf("[LoginAndAuthorize] User Lookup Error: %s", req.Email)
		c.JSON(
			http.StatusUnauthorized,
			dto.ErrorResponse{Error: "invalid credentials"},
		)
		return
	}

	if err := utils.CompareSecret(storedHash, req.Password); err != nil {
		log.Printf(
			"[LoginAndAuthorize] Password Verification Failed: %s",
			req.Email,
		)
		c.JSON(
			http.StatusUnauthorized,
			dto.ErrorResponse{Error: "invalid credentials"},
		)
		return
	}

	code, err := utils.GenerateAuthorizationCode()
	if err != nil {
		log.Printf("[LoginAndAuthorize] Code Generation Error: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "internal error"},
		)
		return
	}

	clientUUID, err := uuid.Parse(req.ClientID)
	if err != nil {
		log.Printf("[LoginAndAuthorize] Client ID Parse Error: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "invalid client_id"},
		)
		return
	}

	var clientIDBytes [16]byte
	copy(clientIDBytes[:], clientUUID[:])

	registeredURI, err := h.Repo.GetClientRedirectURI(clientIDBytes[:])
	if err != nil {
		log.Printf("[LoginAndAuthorize] Client Registry Lookup Error: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "invalid_client"},
		)
		return
	}

	if req.RedirectURI != registeredURI {
		log.Printf("[LoginAndAuthorize] Redirect URI Mismatch Error: %s",
			req.Email)
		c.JSON(
			http.StatusForbidden,
			dto.ErrorResponse{Error: "unauthorized_redirect_uri"},
		)
		return
	}

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		log.Printf("[LoginAndAuthorize] parse error: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "invalid user_Id"},
		)
		return
	}

	err = h.Repo.StoreCode(code, userID[:], clientIDBytes[:],
		req.RedirectURI)
	if err != nil {
		log.Printf("[LoginAndAuthorize] Database Store Code Error: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "database error"},
		)
		return
	}

	sessionID, _ := utils.GenerateRandomString(32)
	expiry := time.Now().AddDate(SESSION_YEARS, SESSION_MONTHS, SESSION_DAYS)

	newSession := &models.IdPSession{
		SessionId: sessionID,
		UserId:    userID[:],
		IpAddress: c.ClientIP(),
		UserAgent: c.Request.UserAgent(),
		ExpiresAt: expiry,
	}

	if err := h.SessionRepo.Create(newSession); err != nil {
		log.Printf("[LoginAndAuthorize] Database Session Create Error: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "session error"},
		)
		return
	}

	maxAge := int(time.Hour.Seconds() * 24 * SESSION_DAYS)
	c.SetCookie("idp_session", sessionID, maxAge, "/", "", true, true)

	c.JSON(http.StatusOK, gin.H{
		"redirect_to": req.RedirectURI + "?code=" + code,
	})
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
	sessionID, err := c.Cookie("idp_session")
	if err != nil {
		c.JSON(
			http.StatusOK,
			dto.SuccessResponse{Message: "already logged out"},
		)
		return
	}

	session, err := h.SessionRepo.GetByID(sessionID)
	if err != nil {
		c.SetCookie("idp_session", "", -1, "/", "", true, true)
		c.JSON(http.StatusOK, dto.SuccessResponse{Message: "session cleared"})
		return
	}

	if err := h.Repo.RevokeTokens(session.UserId); err != nil {
		log.Printf("[Logout] Token Revocation Error: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "logout failed"},
		)
		return
	}

	c.SetCookie("idp_session", "", -1, "/", "", true, true)
	c.JSON(
		http.StatusOK,
		dto.SuccessResponse{Message: "global logout successful"},
	)
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
	sessionID, err := c.Cookie("idp_session")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false})
		return
	}

	session, err := h.SessionRepo.GetByID(sessionID)
	if err != nil || time.Now().After(session.ExpiresAt) {
		c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"authenticated": true,
		"user_id":       session.UserId,
	})
}

// GetJWKS handles the retrieval of public keys for token verification
func (h *AuthHandler) GetJWKS(c *gin.Context) {
	keyID := os.Getenv("KEY_ID")
	jwk := service.PublicKeyToJWK(h.PublicKey, keyID)

	jwks := service.JWKS{
		Keys: []service.JWK{jwk},
	}

	c.JSON(http.StatusOK, jwks)
}
