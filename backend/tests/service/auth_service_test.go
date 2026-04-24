package service_test

import (
	"context"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
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
