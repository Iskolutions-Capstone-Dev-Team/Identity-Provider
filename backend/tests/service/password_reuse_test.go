package service_test

import (
	"context"
	"errors"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/cache"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

func TestValidatePasswordReuse_MatchesCurrent(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockRegRepo := mocks.NewMockRegistrationRepository(ctrl)
	mockCauRepo := mocks.NewMockClientAllowedUserRepository(ctrl)
	mockPassHistRepo := mocks.NewMockPasswordHistoryRepository(ctrl)

	userService := service.NewUserService(
		mockUserRepo,
		mockClientRepo,
		mockRegRepo,
		mockCauRepo,
		mockPassHistRepo,
		cache.NewNoopCache(),
	)

	currentPassword := "CurrentP@ssword123"
	currentHash, err := utils.HashSecret(currentPassword)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	userID := uuid.New()
	err = userService.ValidatePasswordReuse(
		context.Background(),
		userID,
		currentHash,
		currentPassword,
	)
	if !errors.Is(err, service.ErrPasswordRecentlyUsed) {
		t.Fatalf("expected ErrPasswordRecentlyUsed, got: %v", err)
	}
}

func TestValidatePasswordReuse_MatchesHistory(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockRegRepo := mocks.NewMockRegistrationRepository(ctrl)
	mockCauRepo := mocks.NewMockClientAllowedUserRepository(ctrl)
	mockPassHistRepo := mocks.NewMockPasswordHistoryRepository(ctrl)

	userService := service.NewUserService(
		mockUserRepo,
		mockClientRepo,
		mockRegRepo,
		mockCauRepo,
		mockPassHistRepo,
		cache.NewNoopCache(),
	)

	currentHash, _ := utils.HashSecret("CurrentP@ssword123")
	oldPassword := "OldP@ssword123"
	oldHash, _ := utils.HashSecret(oldPassword)

	userID := uuid.New()
	mockPassHistRepo.EXPECT().
		GetRecentPasswordHashes(gomock.Any(), userID[:], 5).
		Return([]string{oldHash}, nil).
		Times(1)

	err := userService.ValidatePasswordReuse(
		context.Background(),
		userID,
		currentHash,
		oldPassword,
	)
	if !errors.Is(err, service.ErrPasswordRecentlyUsed) {
		t.Fatalf("expected ErrPasswordRecentlyUsed, got: %v", err)
	}
}

func TestValidatePasswordReuse_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockRegRepo := mocks.NewMockRegistrationRepository(ctrl)
	mockCauRepo := mocks.NewMockClientAllowedUserRepository(ctrl)
	mockPassHistRepo := mocks.NewMockPasswordHistoryRepository(ctrl)

	userService := service.NewUserService(
		mockUserRepo,
		mockClientRepo,
		mockRegRepo,
		mockCauRepo,
		mockPassHistRepo,
		cache.NewNoopCache(),
	)

	currentHash, _ := utils.HashSecret("CurrentP@ssword123")
	oldHash, _ := utils.HashSecret("OldP@ssword123")
	newPassword := "BrandNewP@ssword456"

	userID := uuid.New()
	mockPassHistRepo.EXPECT().
		GetRecentPasswordHashes(gomock.Any(), userID[:], 5).
		Return([]string{oldHash}, nil).
		Times(1)

	err := userService.ValidatePasswordReuse(
		context.Background(),
		userID,
		currentHash,
		newPassword,
	)
	if err != nil {
		t.Fatalf("expected nil error, got: %v", err)
	}
}

func TestChangePassword_ReusePrevented(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockRegRepo := mocks.NewMockRegistrationRepository(ctrl)
	mockCauRepo := mocks.NewMockClientAllowedUserRepository(ctrl)
	mockPassHistRepo := mocks.NewMockPasswordHistoryRepository(ctrl)

	userService := service.NewUserService(
		mockUserRepo,
		mockClientRepo,
		mockRegRepo,
		mockCauRepo,
		mockPassHistRepo,
		cache.NewNoopCache(),
	)

	userID := uuid.New()
	email := "user@example.com"
	currentPassword := "CurrentP@ssword123"
	currentHash, _ := utils.HashSecret(currentPassword)

	user := &models.User{
		ID:           userID[:],
		Email:        email,
		PasswordHash: currentHash,
	}

	mockUserRepo.EXPECT().
		GetUserById(gomock.Any(), userID[:], nil, true).
		Return(user, nil).
		Times(1)

	mockUserRepo.EXPECT().
		GetUserByEmail(gomock.Any(), email).
		Return(user, nil).
		Times(1)

	// Attempting to change to current password
	err := userService.ChangePassword(
		context.Background(),
		userID,
		currentPassword,
		currentPassword,
	)
	if !errors.Is(err, service.ErrPasswordRecentlyUsed) {
		t.Fatalf("expected ErrPasswordRecentlyUsed, got: %v", err)
	}
}

func TestChangePassword_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockRegRepo := mocks.NewMockRegistrationRepository(ctrl)
	mockCauRepo := mocks.NewMockClientAllowedUserRepository(ctrl)
	mockPassHistRepo := mocks.NewMockPasswordHistoryRepository(ctrl)

	userService := service.NewUserService(
		mockUserRepo,
		mockClientRepo,
		mockRegRepo,
		mockCauRepo,
		mockPassHistRepo,
		cache.NewNoopCache(),
	)

	userID := uuid.New()
	email := "user@example.com"
	currentPassword := "CurrentP@ssword123"
	currentHash, _ := utils.HashSecret(currentPassword)
	newPassword := "SuperSecureNewP@ssword99"

	user := &models.User{
		ID:           userID[:],
		Email:        email,
		PasswordHash: currentHash,
	}

	mockUserRepo.EXPECT().
		GetUserById(gomock.Any(), userID[:], nil, true).
		Return(user, nil).
		Times(1)

	mockUserRepo.EXPECT().
		GetUserByEmail(gomock.Any(), email).
		Return(user, nil).
		Times(1)

	mockPassHistRepo.EXPECT().
		GetRecentPasswordHashes(gomock.Any(), userID[:], 5).
		Return([]string{}, nil).
		Times(1)

	mockUserRepo.EXPECT().
		UpdateUserPassword(gomock.Any(), gomock.Any()).
		Return(nil).
		Times(1)

	mockPassHistRepo.EXPECT().
		PrunePasswordHistory(gomock.Any(), userID[:], 5).
		Return(nil).
		Times(1)

	err := userService.ChangePassword(
		context.Background(),
		userID,
		currentPassword,
		newPassword,
	)
	if err != nil {
		t.Fatalf("expected nil error, got: %v", err)
	}
}
