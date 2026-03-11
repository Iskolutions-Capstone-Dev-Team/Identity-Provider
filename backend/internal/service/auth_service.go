package service

import (
	"bytes"
	"context"
	"crypto/rsa"
	"fmt"
	"os"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/google/uuid"
)

type AuthService struct {
	Repo        *repository.AuthCodeRepository
	SessionRepo *repository.SessionRepository
	ClientRepo  *repository.ClientRepository
	PrivateKey  *rsa.PrivateKey
	PublicKey   *rsa.PublicKey
}

/**
 * Authorize validates the user's session and generates an
 * authorization code for the requesting client.
 */
func (s *AuthService) Authorize(
	ctx context.Context,
	clientIDStr string,
	sessionToken string,
) (string, error) {
	clientID, err := uuid.Parse(clientIDStr)
	if err != nil {
		return "", fmt.Errorf("UUID Parse: %w", err)
	}

	// 1. Session Validation
	session, err := s.SessionRepo.GetByID(sessionToken)
	currentTime := time.Now()
	if currentTime.After(session.ExpiresAt) {
		return "", fmt.Errorf("Expired session")
	}

	// 2. Client Verification
	client, err := s.ClientRepo.GetByID(clientID[:])
	if err != nil {
		return "", fmt.Errorf("Database Query (GetClient): %w", err)
	}

	// 3. Code Generation
	code, err := utils.GenerateAuthorizationCode()
	if err != nil {
		return "", fmt.Errorf("Code Generation: %w", err)
	}

	return fmt.Sprintf("%s?code=%s", client.RedirectUri, code), nil
}

/**
 * LoginAndAuthorize verifies credentials and generates an
 * authorization code and a session for the user.
 */
func (s *AuthService) LoginAndAuthorize(
	ctx context.Context,
	req dto.LoginRequest,
	ipAddress,
	userAgent string,
) (string, string, error) {
	// 1. Authenticate User
	claims, storedHash, err := s.Repo.GetUserForAuth(req.Email)
	if err != nil {
		return "", "", fmt.Errorf("Database Query (UserLookup): %w", err)
	}

	if err := utils.CompareSecret(storedHash, req.Password); err != nil {
		return "", "", fmt.Errorf("Secret Verification: invalid credentials")
	}

	// 2. Client Validation
	clientUUID, _ := uuid.Parse(req.ClientID)
	regURI, err := s.Repo.GetClientRedirectURI(clientUUID[:])
	if err != nil {
		return "", "", fmt.Errorf("Database Query (ClientLookup): %w", err)
	}

	// 3. Authorization Code Logic
	code, _ := utils.GenerateAuthorizationCode()
	userID, _ := uuid.Parse(claims.UserID)
	err = s.Repo.StoreCode(code, userID[:], clientUUID[:], regURI)
	if err != nil {
		return "", "", fmt.Errorf("Database Query (StoreCode): %w", err)
	}

	// 4. Session Management
	sessionID, err := s.GetSessionToken(userID, ipAddress, userAgent)

	redirectURL := fmt.Sprintf("%s?code=%s", regURI, code)
	return redirectURL, sessionID, nil
}

/**
 * Logout revokes all active tokens for the user associated
 * with the provided session ID.
 */
func (s *AuthService) Logout(
	ctx context.Context,
	sessionID string,
) error {
	// 1. Retrieve session to identify the user
	session, err := s.SessionRepo.GetByID(sessionID)
	if err != nil {
		return fmt.Errorf("Database Query (GetSession): %w", err)
	}

	// 2. Perform global token revocation
	err = s.Repo.RevokeTokens(session.UserId)
	if err != nil {
		return fmt.Errorf("Database Query (RevokeTokens): %w", err)
	}

	// 3. Optional: Delete the session from DB
	_ = s.SessionRepo.Delete(sessionID)

	return nil
}

/**
 * ValidateSession checks if a session ID exists and is still
 * within its valid timeframe.
 */
func (s *AuthService) ValidateSession(
	ctx context.Context,
	sessionID string,
) (*models.IdPSession, error) {
	session, err := s.SessionRepo.GetByID(sessionID)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetSession): %w", err)
	}

	// Logic: Session must not be expired
	if time.Now().After(session.ExpiresAt) {
		return nil, fmt.Errorf("Session Validation: expired")
	}

	return session, nil
}

/**
 * GetJWKS constructs the JSON Web Key Set containing the
 * active public keys for token verification.
 */
func (s *AuthService) GetJWKS(ctx context.Context) (*JWKS, error) {
	keyID := os.Getenv("KEY_ID")

	// Convert internal RSA Public Key to JWK format
	jwk := PublicKeyToJWK(s.PublicKey, keyID)

	return &JWKS{
		Keys: []JWK{jwk},
	}, nil
}

/**
 * ExchangeCodeForToken validates the authorization code and client
 * credentials before generating access and refresh tokens.
 */
func (s *AuthService) ExchangeCodeForToken(
	ctx context.Context,
	req dto.TokenExchangeRequest,
) (*dto.TokenResponse, error) {
	clientUUID, err := uuid.Parse(req.ClientID)
	if err != nil {
		return nil, fmt.Errorf("UUID Parse: %w", err)
	}
	clientIDBin := clientUUID[:]

	// 1. Authenticate Client
	valid, err := s.Repo.VerifyClient(clientIDBin, req.ClientSecret)
	if err != nil || !valid {
		return nil, fmt.Errorf("Client Verification: %w", err)
	}

	// 2. Consume Authorization Code
	authCode, err := s.Repo.ExchangeCode(req.Code)
	if err != nil {
		return nil, fmt.Errorf("Code Exchange: %w", err)
	}

	// 3. Security Check: Client Mismatch
	if !bytes.Equal(authCode.ClientId, clientIDBin) {
		return nil, fmt.Errorf("Client Verification: id mismatch")
	}

	// 4. Identity Retrieval
	claims, err := s.Repo.GetClaimsByID(authCode.UserId)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetClaims): %w", err)
	}

	client, err := s.ClientRepo.GetByID(clientIDBin)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetClient): %w", err)
	}

	// 5. Token Generation
	accessToken, err := GenerateToken(s.PrivateKey, client, *claims)
	if err != nil {
		return nil, fmt.Errorf("Token Generation: %w", err)
	}

	refreshStr, _ := utils.GenerateRandomString(SECRET_ENTROPY)
	err = s.Repo.StoreRefreshToken(
		refreshStr,
		authCode.UserId,
		clientIDBin,
	)
	if err != nil {
		return nil, fmt.Errorf("Database Query (StoreRefresh): %w", err)
	}

	return &dto.TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshStr,
		ExpiresIn:    ACCESS_TOKEN_EXPIRY,
		TokenType:    "Bearer",
	}, nil
}

/**
 * RotateRefreshToken validates an existing refresh token,
 * invalidates it, and issues a new pair of access and refresh tokens.
 */
func (s *AuthService) RotateRefreshToken(
	ctx context.Context,
	oldToken string,
) (*dto.TokenResponse, error) {
	// 1. Identify User and Client from the existing token
	uID, cID, err := s.Repo.GetIDsFromToken(oldToken)
	if err != nil {
		return nil, fmt.Errorf("Database Query (TokenLookup): %w", err)
	}

	// 2. Generate and persist new Refresh Token
	newToken, err := utils.GenerateRandomString(SECRET_ENTROPY)
	if err != nil {
		return nil, fmt.Errorf("Token Generation: %w", err)
	}

	err = s.Repo.RotateRefreshToken(oldToken, newToken)
	if err != nil {
		return nil, fmt.Errorf("Database Query (RotateToken): %w", err)
	}

	// 3. Retrieve Identity and Client data
	claims, err := s.Repo.GetClaimsByID(uID)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetClaims): %w", err)
	}

	client, err := s.ClientRepo.GetByID(cID)
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

func (s *AuthService) GetSessionToken(userID uuid.UUID,
	ipAddress, userAgent string,
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

	if err := s.SessionRepo.Create(session); err != nil {
		return "", fmt.Errorf("Database Query (CreateSession): %w", err)
	}

	return sessionID, nil
}
