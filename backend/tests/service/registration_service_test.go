package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"go.uber.org/mock/gomock"
)

/**
 * TestCheckInvitation service test verifies logic for checking invitation codes.
 */
func TestCheckInvitation(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRegRepo := mocks.NewMockRegistrationRepository(ctrl)
	mockInvRepo := mocks.NewMockInvitationRepository(ctrl)
	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockCauRepo := mocks.NewMockClientAllowedUserRepository(ctrl)

	regService := service.NewRegistrationService(mockRegRepo, mockInvRepo, mockUserRepo, mockCauRepo)

	code := "invitation-code"
	inv := &models.InvitationCode{
		Email:          "test@example.com",
		InvitationCode: code,
		CreatedAt:      time.Now(),
	}

	// 1. Setup mock expectations
	mockInvRepo.EXPECT().
		GetInvitationByCode(gomock.Any(), code).
		Return(inv, nil)

	// 2. Execute
	valid, err := regService.CheckInvitation(context.Background(), code)

	// 3. Verify
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if !valid {
		t.Error("expected invitation to be valid")
	}
}
