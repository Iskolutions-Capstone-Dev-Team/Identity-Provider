package service_test

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

/**
 * TestAuthLogout verifies that logout revokes tokens and deletes session.
 */
func TestAuthLogout(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockAuthRepo := mocks.NewMockAuthCodeRepository(ctrl)
	mockSessionRepo := mocks.NewMockSessionRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)

	authService := service.NewAuthService(
		mockAuthRepo,
		mockSessionRepo,
		mockClientRepo,
		nil, nil, // Keys not needed for logout
	)

	sessionID := "valid-session-id"
	userID := []byte("user-uuid")
	session := &models.IdPSession{
		SessionId: sessionID,
		UserId:    userID,
	}

	// 1. Setup mock expectations
	// First, fetch the session
	mockSessionRepo.EXPECT().
		GetByID(gomock.Any(), sessionID).
		Return(session, nil).
		Times(1)

	// Second, revoke tokens for that user
	mockAuthRepo.EXPECT().
		RevokeTokens(gomock.Any(), userID).
		Return(nil).
		Times(1)

	// Third, delete the session
	mockSessionRepo.EXPECT().
		Delete(gomock.Any(), sessionID).
		Return(nil).
		Times(1)

	// 2. Execute
	err := authService.Logout(context.Background(), sessionID)

	// 3. Verify
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
}

/**
 * TestCheckSessionOrPendingMFA_Fallback verifies fallback token validation.
 */
func TestCheckSessionOrPendingMFA_Fallback(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("failed to generate rsa key: %v", err)
	}
	publicKey := &privateKey.PublicKey

	mockAuthRepo := mocks.NewMockAuthCodeRepository(ctrl)
	mockSessionRepo := mocks.NewMockSessionRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)

	s := service.NewAuthService(
		mockAuthRepo,
		mockSessionRepo,
		mockClientRepo,
		privateKey,
		publicKey,
	)

	// Set CLIENT_BASE_URL and KEY_ID env for token generation
	os.Setenv("CLIENT_BASE_URL", "http://localhost:8080")
	os.Setenv("KEY_ID", "test-key-id")

	userID := uuid.New()
	clientID := uuid.New()
	client := &models.Client{
		ID:             clientID[:],
		BaseUrl:        "http://client.com",
		AccessTokenTTL: 30,
	}

	claims := models.UserClaims{
		UserID: userID.String(),
	}

	// 1. Generate OIDC Access Token
	accessToken, err := service.GenerateToken(privateKey, client, claims)
	if err != nil {
		t.Fatalf("failed to generate access token: %v", err)
	}

	// 2. Generate Pending MFA Token
	pendingToken, err := service.GenerateMFAPendingToken(
		privateKey,
		userID.String(),
		"test@email.com",
		"127.0.0.1",
		"Mozilla",
	)
	if err != nil {
		t.Fatalf("failed to generate pending mfa token: %v", err)
	}

	// Test Fallback with OIDC Access Token in Authorization header
	t.Run("OIDC Access Token Fallback", func(t *testing.T) {
		gin.SetMode(gin.TestMode)
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		req, _ := http.NewRequest("GET", "/mfa/verify", nil)
		req.Header.Set("Authorization", "Bearer "+accessToken)
		c.Request = req

		uID, isPending, _, err := s.CheckSessionOrPendingMFA(c)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if isPending {
			t.Error("expected isPending to be false for access token fallback")
		}
		if uID != userID {
			t.Errorf("expected userID %v, got %v", userID, uID)
		}
	})

	// Test Pending MFA Token in Authorization header
	t.Run("Pending MFA Token", func(t *testing.T) {
		gin.SetMode(gin.TestMode)
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		req, _ := http.NewRequest("GET", "/mfa/verify", nil)
		req.Header.Set("Authorization", "Bearer "+pendingToken)
		c.Request = req

		uID, isPending, _, err := s.CheckSessionOrPendingMFA(c)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if !isPending {
			t.Error("expected isPending to be true for pending mfa token")
		}
		if uID != userID {
			t.Errorf("expected userID %v, got %v", userID, uID)
		}
	})
}
