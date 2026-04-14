package service

import (
	"bytes"
	"context"
	"crypto/rsa"
	"fmt"
	"os"
	"slices"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthService interface {
	Authorize(ctx context.Context, clientIDStr string,
		sessionToken string) (string, error)
	LoginAndAuthorize(ctx context.Context, req dto.LoginRequest,
		ipAddress, userAgent string) (string, string, error)
	Logout(ctx context.Context, sessionID string) error
	ValidateSession(ctx context.Context,
		sessionID string) (*models.IdPSession, error)
	GetJWKS(ctx context.Context) (*JWKS, error)
	ExchangeCodeForToken(ctx context.Context,
		req dto.TokenExchangeRequest) (*dto.TokenResponse, error)
	RotateRefreshToken(ctx context.Context,
		oldToken string) (*dto.TokenResponse, error)
	GetSessionToken(ctx context.Context, userID uuid.UUID,
		ipAddress, userAgent string) (string, error)
	RevokeAllUserTokens(ctx context.Context, userID uuid.UUID) error
	RefreshBySession(ctx context.Context, sessionID string, 
		clientID string) (*dto.TokenResponse, error)
	RevokeCookies(c *gin.Context)
}

type authService struct {
	Repo        repository.AuthCodeRepository
	SessionRepo repository.SessionRepository
	ClientRepo  repository.ClientRepository
	PrivateKey  *rsa.PrivateKey
	PublicKey   *rsa.PublicKey
}

func NewAuthService(repo repository.AuthCodeRepository,
	sessionRepo repository.SessionRepository,
	clientRepo repository.ClientRepository,
	privateKey *rsa.PrivateKey, publicKey *rsa.PublicKey,
) AuthService {
	return &authService{
		Repo:        repo,
		SessionRepo: sessionRepo,
		ClientRepo:  clientRepo,
		PrivateKey:  privateKey,
		PublicKey:   publicKey,
	}
}

/**
 * Authorize validates the user's session and generates an
 * authorization code for the requesting client.
 */
func (s *authService) Authorize(
	ctx context.Context,
	clientIDStr string,
	sessionToken string,
) (string, error) {
	clientID, err := uuid.Parse(clientIDStr)
	if err != nil {
		return "", fmt.Errorf("UUID Parse: %w", err)
	}

	// 1. Session Validation
	session, err := s.SessionRepo.GetByID(ctx, sessionToken)
	if session == nil {
		return "", fmt.Errorf("No session Found")
	}

	currentTime := time.Now()
	if currentTime.After(session.ExpiresAt) {
		return "", fmt.Errorf("Expired session")
	}

	// 2. Client Verification
	client, err := s.ClientRepo.GetByID(ctx, clientID[:])
	if err != nil {
		return "", fmt.Errorf("Database Query (GetClient): %w", err)
	}

	// 3. Code Generation
	code, err := utils.GenerateAuthorizationCode()
	if err != nil {
		return "", fmt.Errorf("Code Generation: %w", err)
	}

	userID := session.UserId
	err = s.Repo.StoreCode(ctx, code, userID[:], clientID[:], client.RedirectUri)
	if err != nil {
		return "", fmt.Errorf("Code Storage: %w", err)
	}

	return fmt.Sprintf("%s?code=%s", client.RedirectUri, code), nil
}

/**
 * LoginAndAuthorize verifies credentials and generates an
 * authorization code and a session for the user.
 */
func (s *authService) LoginAndAuthorize(
	ctx context.Context,
	req dto.LoginRequest,
	ipAddress,
	userAgent string,
) (string, string, error) {
	// 1. Authenticate User
	claims, storedHash, err := s.Repo.GetUserForAuth(ctx, req.Email)
	if err != nil {
		return "", "", fmt.Errorf("Database Query (UserLookup): %w", err)
	}

	if err := utils.CompareSecret(storedHash, req.Password); err != nil {
		return "", "", fmt.Errorf("Secret Verification: invalid credentials")
	}

	// 2. Client Validation
	clientUUID, _ := uuid.Parse(req.ClientID)
	regURI, err := s.Repo.GetClientRedirectURI(ctx, clientUUID[:])
	if err != nil {
		return "", "", fmt.Errorf("Database Query (ClientLookup): %w", err)
	}

	// 3. Authorization Code Logic
	code, _ := utils.GenerateAuthorizationCode()
	userID, _ := uuid.Parse(claims.UserID)
	err = s.Repo.StoreCode(ctx, code, userID[:], clientUUID[:], regURI)
	if err != nil {
		return "", "", fmt.Errorf("Database Query (StoreCode): %w", err)
	}

	// 4. Session Management
	sessionID, err := s.GetSessionToken(ctx, userID, ipAddress, userAgent)

	redirectURL := fmt.Sprintf("%s?code=%s", regURI, code)
	return redirectURL, sessionID, nil
}

/**
 * Logout revokes all active tokens for the user associated
 * with the provided session ID.
 */
func (s *authService) Logout(
	ctx context.Context,
	sessionID string,
) error {
	// 1. Retrieve session to identify the user
	session, err := s.SessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("Database Query (GetSession): %w", err)
	}

	// 2. Perform global token revocation
	err = s.Repo.RevokeTokens(ctx, session.UserId)
	if err != nil {
		return fmt.Errorf("Database Query (RevokeTokens): %w", err)
	}

	// 3. Optional: Delete the session from DB
	_ = s.SessionRepo.Delete(ctx, sessionID)

	return nil
}

/**
 * RevokeAllUserTokens invalidates all active tokens for a specific user.
 */
func (s *authService) RevokeAllUserTokens(
	ctx context.Context,
	userID uuid.UUID,
) error {
	return s.Repo.RevokeTokens(ctx, userID[:])
}

/**
 * ValidateSession checks if a session ID exists and is still active.
 */
func (s *authService) ValidateSession(
	ctx context.Context,
	sessionID string,
) (*models.IdPSession, error) {
	session, err := s.SessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetSession): %w", err)
	}

	if time.Now().After(session.ExpiresAt) {
		return nil, fmt.Errorf("Session Validation: expired")
	}

	return session, nil
}

/**
 * GetJWKS constructs the JSON Web Key Set.
 */
func (s *authService) GetJWKS(ctx context.Context) (*JWKS, error) {
	keyID := os.Getenv("KEY_ID")

	jwk := PublicKeyToJWK(s.PublicKey, keyID)

	return &JWKS{
		Keys: []JWK{jwk},
	}, nil
}

/**
 * ExchangeCodeForToken validates the authorization code and client.
 */
func (s *authService) ExchangeCodeForToken(
	ctx context.Context,
	req dto.TokenExchangeRequest,
) (*dto.TokenResponse, error) {
	clientUUID, err := uuid.Parse(req.ClientID)
	if err != nil {
		return nil, fmt.Errorf("UUID Parse: %w", err)
	}
	clientIDBin := clientUUID[:]

	// 1. Authenticate Client
	valid, err := s.Repo.VerifyClient(ctx, clientIDBin, req.ClientSecret)
	if err != nil {
		return nil, fmt.Errorf("Client Verification: %w", err)
	}
	if !valid {
		return nil, fmt.Errorf("Client Verification: invalid credentials")
	}

	// 2. Consume Authorization Code
	authCode, err := s.Repo.ExchangeCode(ctx, req.Code)
	if err != nil {
		return nil, fmt.Errorf("Code Exchange: %w", err)
	}

	// 3. Security Check: Client Mismatch
	if !bytes.Equal(authCode.ClientId, clientIDBin) {
		return nil, fmt.Errorf("Client Verification: id mismatch")
	}

	// 4. Identity Retrieval
	claims, err := s.Repo.GetClaimsByID(ctx, authCode.UserId)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetClaims): %w", err)
	}

	client, err := s.ClientRepo.GetByID(ctx, clientIDBin)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetClient): %w", err)
	}

	// 5. Token Generation
	accessToken, err := GenerateToken(s.PrivateKey, client, *claims)
	if err != nil {
		return nil, fmt.Errorf("Token Generation: %w", err)
	}

	grants, _ := s.ClientRepo.GetGrantTypes(ctx, clientIDBin)
	var refreshStr string
	if slices.Contains(grants, "refresh_token") {
		// Optimization: If this is the primary IDP client, skip DB storage.
		// The frontend will use the session cookie for refresh.
		if req.ClientID == os.Getenv("CLIENT_ID") {
			refreshStr = "internal_session_managed"
		} else {
			refreshStr, _ = utils.GenerateRandomString(SECRET_ENTROPY)
			err = s.Repo.StoreRefreshToken(
				ctx,
				refreshStr,
				authCode.UserId,
				clientIDBin,
			)
			if err != nil {
				return nil, fmt.Errorf("Database Query (StoreRefresh): %w", err)
			}
		}
	}

	return &dto.TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshStr,
		ExpiresIn:    ACCESS_TOKEN_EXPIRY,
		TokenType:    "Bearer",
	}, nil
}

/**
 * RotateRefreshToken validates an existing refresh token and issues a new pair.
 */
func (s *authService) RotateRefreshToken(
	ctx context.Context,
	oldToken string,
) (*dto.TokenResponse, error) {
	// 1. Identify User and Client from the existing token
	uID, cID, err := s.Repo.GetIDsFromToken(ctx, oldToken)
	if err != nil {
		return nil, fmt.Errorf("Database Query (TokenLookup): %w", err)
	}

	// 1.1 Verify Client Grant Type
	grants, _ := s.ClientRepo.GetGrantTypes(ctx, cID)
	if !slices.Contains(grants, "refresh_token") {
		return nil, fmt.Errorf("Client Verification: missing refresh_token grant")
	}

	// 2. Generate and persist new Refresh Token
	newToken, err := utils.GenerateRandomString(SECRET_ENTROPY)
	if err != nil {
		return nil, fmt.Errorf("Token Generation: %w", err)
	}

	err = s.Repo.RotateRefreshToken(ctx, oldToken, newToken)
	if err != nil {
		return nil, fmt.Errorf("Database Query (RotateToken): %w", err)
	}

	// 3. Retrieve Identity and Client data
	claims, err := s.Repo.GetClaimsByID(ctx, uID)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetClaims): %w", err)
	}

	client, err := s.ClientRepo.GetByID(ctx, cID)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetClient): %w", err)
	}

	// 4. Mint new Access Token
	accessToken, err := GenerateToken(s.PrivateKey, client, *claims)
	if err != nil {
		return nil, fmt.Errorf("Token Generation (JWT): %w", err)
	}

	return &dto.TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: newToken,
		ExpiresIn:    ACCESS_TOKEN_EXPIRY,
		TokenType:    "Bearer",
	}, nil
}

/**
 * RefreshBySession issues a new access token based on a valid session ID.
 */
func (s *authService) RefreshBySession(
	ctx context.Context,
	sessionID string,
	clientIDStr string,
) (*dto.TokenResponse, error) {
	// 1. Validate Session
	session, err := s.SessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetSession): %w", err)
	}

	if time.Now().After(session.ExpiresAt) {
		return nil, fmt.Errorf("Session Validation: expired")
	}

	// 2. Validate Client
	cUUID, err := uuid.Parse(clientIDStr)
	if err != nil {
		return nil, fmt.Errorf("UUID Parse: %w", err)
	}

	client, err := s.ClientRepo.GetByID(ctx, cUUID[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetClient): %w", err)
	}

	// 3. Retrieve Identity
	claims, err := s.Repo.GetClaimsByID(ctx, session.UserId)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetClaims): %w", err)
	}

	// 4. Mint new Access Token
	accessToken, err := GenerateToken(s.PrivateKey, client, *claims)
	if err != nil {
		return nil, fmt.Errorf("Token Generation (JWT): %w", err)
	}

	return &dto.TokenResponse{
		AccessToken: accessToken,
		ExpiresIn:   ACCESS_TOKEN_EXPIRY,
		TokenType:   "Bearer",
	}, nil
}

func (s *authService) GetSessionToken(ctx context.Context,
	userID uuid.UUID, ipAddress, userAgent string,
) (string, error) {
	sessionID, _ := utils.GenerateRandomString(32)
	expiry := time.Now().AddDate(
		SESSION_YEARS,
		SESSION_MONTHS,
		SESSION_DAYS,
	)

	session := &models.IdPSession{
		SessionId: sessionID,
		UserId:    userID[:],
		IpAddress: ipAddress,
		UserAgent: userAgent,
		ExpiresAt: expiry,
	}

	if err := s.SessionRepo.Create(ctx, session); err != nil {
		return "", fmt.Errorf("Database Query (CreateSession): %w", err)
	}

	return sessionID, nil
}

func (s *authService) RevokeCookies(c *gin.Context) {
	c.SetCookie(
		SESSION_COOKIE_NAME,
		"",
		-1,
		"/",
		"",
		true,
		true,
	)
	c.SetCookie(
		ACCESS_TOKEN_NAME,
		"",
		-1,
		"/",
		"",
		true,
		true,
	)
}
