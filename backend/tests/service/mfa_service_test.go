package service_test

import (
	"context"
	"os"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

func TestSetupTOTP(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// Set encryption key for test
	os.Setenv("MFA_ENCRYPTION_KEY", 
		"94f9aae6af350c1f2ccb6f02702d66262a12ccb5aad6ef97f5bb283c4c5927ef")

	mockRepo := mocks.NewMockMFARepository(ctrl)
	mfaService := service.NewMFAService(mockRepo)

	userID := uuid.New()
	email := "test@example.com"

	// Expect 1 TOTP insert + 10 backup code inserts
	mockRepo.EXPECT().InsertAuthenticator(gomock.Any(), gomock.Any()).
		Return(nil).Times(11)

	uri, backupCodes, err := mfaService.SetupTOTP(context.Background(),
		userID[:], email)

	if err != nil {
		t.Fatalf("Failed to setup TOTP: %v", err)
	}

	if uri == "" {
		t.Error("Expected non-empty URI")
	}

	if len(backupCodes) != 10 {
		t.Errorf("Expected 10 backup codes, got %d", len(backupCodes))
	}
}
