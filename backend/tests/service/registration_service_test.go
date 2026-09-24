package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/google/uuid"
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
		{
			AccountTypeID:   1,
			AccountTypeName: "Type A",
			IsSelectable:    true,
			ClientID:        []byte{1},
			ClientName:      "Client 1",
		},
		{
			AccountTypeID:   2,
			AccountTypeName: "Type B",
			IsSelectable:    true,
			ClientID:        []byte{2},
			ClientName:      "Client 2",
		},
	}

	// 1. Setup mock expectations
	mockRegRepo.EXPECT().CountAccountTypes(ctx, "").Return(5, nil)
	mockRegRepo.EXPECT().
		GetRegistrationConfig(
			ctx, limit, offset, gomock.Any(), gomock.Any(), "",
		).Return(rows, nil)

	// 2. Execute
	permissions := []string{"View all appclients"}
	userID := uuid.New()
	resp, err := regService.GetRegistrationConfig(
		ctx, permissions, userID, limit, page, "", "", "",
	)

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

/**
 * TestGetRegistrationConfig_Scoped verifies the scoped filtering logic.
 */
func TestGetRegistrationConfig_Scoped(t *testing.T) {
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
	userID := uuid.New()

	rows := []repository.AccountTypeClientRow{
		{
			AccountTypeID:   1,
			AccountTypeName: "Type A",
			IsSelectable:    true,
			ClientID:        []byte{1},
			ClientName:      "Client 1",
		},
	}

	// 1. Setup mock expectations
	mockRegRepo.EXPECT().CountScopedAccountTypes(ctx, userID[:], "").
		Return(1, nil)
	mockRegRepo.EXPECT().GetScopedRegistrationConfig(
		ctx, userID[:], limit, offset, gomock.Any(), gomock.Any(), "",
	).Return(rows, nil)

	// 2. Execute
	permissions := []string{"View connected appclients"}
	resp, err := regService.GetRegistrationConfig(
		ctx, permissions, userID, limit, page, "", "", "",
	)

	// 3. Verify
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if resp.TotalCount != 1 {
		t.Errorf("expected TotalCount 1, got %d", resp.TotalCount)
	}

	if len(resp.AccountTypes) != 1 {
		t.Errorf("expected 1 account types, got %d", len(resp.AccountTypes))
	}
}

/**
 * TestGetSelectableAccountTypes verifies fetching selectable account types.
 */
func TestGetSelectableAccountTypes(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRegRepo := mocks.NewMockRegistrationRepository(ctrl)
	mockInvRepo := mocks.NewMockInvitationRepository(ctrl)
	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockCauRepo := mocks.NewMockClientAllowedUserRepository(ctrl)

	regService := service.NewRegistrationService(
		mockRegRepo, mockInvRepo, mockUserRepo, mockCauRepo,
	)

	ctx := context.Background()
	types := []models.AccountType{
		{ID: 1, Name: "student", IsSelectable: true},
		{ID: 2, Name: "faculty", IsSelectable: true},
	}

	mockRegRepo.EXPECT().
		GetSelectableAccountTypes(ctx).
		Return(types, nil)

	res, err := regService.GetSelectableAccountTypes(ctx)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(res) != 2 {
		t.Fatalf("expected 2 selectable account types, got %d", len(res))
	}

	if res[0].ID != 1 || res[0].Name != "student" {
		t.Errorf("unexpected first item: %+v", res[0])
	}
}
