package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
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

/**
 * TestGetRegistrationConfig verifies pagination and client mapping logic.
 */
func TestGetRegistrationConfig(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRegRepo := mocks.NewMockRegistrationRepository(ctrl)
	mockInvRepo := mocks.NewMockInvitationRepository(ctrl)
	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockCauRepo := mocks.NewMockClientAllowedUserRepository(ctrl)

	regService := service.NewRegistrationService(
		mockRegRepo, mockInvRepo, mockUserRepo, mockCauRepo)

	ctx := context.Background()
	limit, page := 2, 1
	offset := 0

	rows := []repository.AccountTypeClientRow{
		{AccountTypeID: 1, AccountTypeName: "Type A", ClientID: []byte{1}, ClientName: "Client 1"},
		{AccountTypeID: 2, AccountTypeName: "Type B", ClientID: []byte{2}, ClientName: "Client 2"},
	}

	// 1. Setup mock expectations
	mockRegRepo.EXPECT().CountAccountTypes(ctx).Return(5, nil)
	mockRegRepo.EXPECT().GetRegistrationConfig(ctx, limit, offset).Return(rows, nil)

	// 2. Execute
	resp, err := regService.GetRegistrationConfig(ctx, limit, page)

	// 3. Verify
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if resp.TotalCount != 5 {
		t.Errorf("expected TotalCount 5, got %d", resp.TotalCount)
	}

	if resp.CurrentPage != 1 {
		t.Errorf("expected CurrentPage 1, got %d", resp.CurrentPage)
	}

	if resp.LastPage != 3 { // (5 + 2 - 1) / 2 = 3
		t.Errorf("expected LastPage 3, got %d", resp.LastPage)
	}

	if len(resp.AccountTypes) != 2 {
		t.Errorf("expected 2 account types, got %d", len(resp.AccountTypes))
	}
}
