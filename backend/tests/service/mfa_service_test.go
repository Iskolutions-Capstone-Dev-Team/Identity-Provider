package service_test

import (
	"context"
	"os"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

func TestGenerateTOTPSetup(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockMFARepository(ctrl)
	mfaService := service.NewMFAService(mockRepo)

	secret, uri, err := mfaService.GenerateTOTPSetup(context.Background(),
		"test@example.com")
	if err != nil {
		t.Fatalf("Failed to generate setup: %v", err)
	}

	if secret == "" || uri == "" {
		t.Error("Secret or URI is empty")
	}
}

func TestFinalizeTOTP(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	os.Setenv("MFA_ENCRYPTION_KEY", 
		"94f9aae6af350c1f2ccb6f02702d66262a12ccb5aad6ef97f5bb283c4c5927ef")

	mockRepo := mocks.NewMockMFARepository(ctrl)
	mfaService := service.NewMFAService(mockRepo)

	userID := uuid.New()
	secret := "JBSWY3DPEHPK3PXP"
	code, _ := utils.ComputeTOTP(secret)

	// 1 TOTP + 10 Backup Codes
	mockRepo.EXPECT().InsertAuthenticator(gomock.Any(), gomock.Any()).
		Return(nil).Times(11)

	backupCodes, err := mfaService.FinalizeTOTP(context.Background(),
		userID[:], secret, code, "My Phone")
	if err != nil {
		t.Fatalf("Failed to finalize: %v", err)
	}

	if len(backupCodes) != 10 {
		t.Errorf("Expected 10 backup codes, got %d", len(backupCodes))
	}
}
