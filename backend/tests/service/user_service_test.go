package service_test

import (
	"context"
	"database/sql"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/cache"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

/**
 * TestGetUserByID verifies the service correctly retrieves a user.
 */
func TestGetUserByID(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockRegRepo := mocks.NewMockRegistrationRepository(ctrl)
	mockCAURepo := mocks.NewMockClientAllowedUserRepository(ctrl)

	userService := service.NewUserService(
		mockRepo,
		mockClientRepo,
		mockRegRepo,
		mockCAURepo,
		cache.NewNoopCache(),
	)

	userID := uuid.New()
	user := &models.User{
		ID:    userID[:],
		Email: "test@example.com",
		AccountTypeID: sql.NullInt64{
			Int64: 2,
			Valid: true,
		},
		AccountType: "faculty",
	}

	// 1. Setup mock expectation: Repository should be called once.
	mockRepo.EXPECT().
		GetUserById(gomock.Any(), userID[:], gomock.Any(), gomock.Any()).
		Return(user, nil).
		Times(1)

	// 2. Execute service call
	adminID := uuid.New()
	resp, err := userService.GetUserByID(
		context.Background(), userID, adminID, []string{},
	)

	// 3. Verify results
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if resp == nil {
		t.Fatal("expected response, got nil")
	}

	if resp.Email != user.Email {
		t.Errorf("expected email %s, got %s", user.Email, resp.Email)
	}

	if resp.AccountTypeID == nil || *resp.AccountTypeID != 2 {
		t.Errorf("expected AccountTypeID 2, got %v", resp.AccountTypeID)
	}

	if resp.AccountType != "faculty" {
		t.Errorf("expected AccountType faculty, got %s", resp.AccountType)
	}
}

func TestSyncAdminClientAccess(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockRegRepo := mocks.NewMockRegistrationRepository(ctrl)
	mockCAURepo := mocks.NewMockClientAllowedUserRepository(ctrl)

	userService := service.NewUserService(
		mockRepo,
		mockClientRepo,
		mockRegRepo,
		mockCAURepo,
		cache.NewNoopCache(),
	)

	userID := uuid.New()
	clientIDs := []string{uuid.New().String(), uuid.New().String()}

	mockClientRepo.EXPECT().
		SyncAdminClientBind(gomock.Any(), userID[:], gomock.Any()).
		Return(nil).
		Times(1)

	err := userService.SyncAdminClientAccess(context.Background(), userID,
		clientIDs)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
}

func TestUpdateUserAccountAndRole(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockRegRepo := mocks.NewMockRegistrationRepository(ctrl)
	mockCAURepo := mocks.NewMockClientAllowedUserRepository(ctrl)

	userService := service.NewUserService(
		mockRepo,
		mockClientRepo,
		mockRegRepo,
		mockCAURepo,
		cache.NewNoopCache(),
	)

	userID := uuid.New()
	accountTypeID := 2
	roleID := 1

	mockRepo.EXPECT().
		UpdateUserRole(gomock.Any(), userID[:], gomock.Any()).
		Return(nil).
		Times(1)

	mockRepo.EXPECT().
		UpdateUserAccountType(gomock.Any(), userID[:], gomock.Any()).
		Return(nil).
		Times(1)

	err := userService.UpdateUserAccountAndRole(
		context.Background(),
		userID,
		&accountTypeID,
		&roleID,
	)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
}

func TestGetUserByID_NullAccountType(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockRegRepo := mocks.NewMockRegistrationRepository(ctrl)
	mockCAURepo := mocks.NewMockClientAllowedUserRepository(ctrl)

	userService := service.NewUserService(
		mockRepo,
		mockClientRepo,
		mockRegRepo,
		mockCAURepo,
		cache.NewNoopCache(),
	)

	userID := uuid.New()
	user := &models.User{
		ID:    userID[:],
		Email: "test@example.com",
		AccountTypeID: sql.NullInt64{
			Valid: false,
		},
		AccountType: "",
	}

	mockRepo.EXPECT().
		GetUserById(gomock.Any(), userID[:], gomock.Any(), gomock.Any()).
		Return(user, nil).
		Times(1)

	adminID := uuid.New()
	resp, err := userService.GetUserByID(
		context.Background(), userID, adminID, []string{},
	)

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if resp == nil {
		t.Fatal("expected response, got nil")
	}

	if resp.AccountTypeID != nil {
		t.Errorf("expected nil AccountTypeID, got %v", resp.AccountTypeID)
	}

	if resp.AccountType != "Custom" {
		t.Errorf("expected AccountType Custom, got %s", resp.AccountType)
	}
}

func TestGetUserList_NullAccountType(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockRegRepo := mocks.NewMockRegistrationRepository(ctrl)
	mockCAURepo := mocks.NewMockClientAllowedUserRepository(ctrl)

	userService := service.NewUserService(
		mockRepo,
		mockClientRepo,
		mockRegRepo,
		mockCAURepo,
		cache.NewNoopCache(),
	)

	userID := uuid.New()
	users := []models.User{
		{
			ID:    userID[:],
			Email: "test@example.com",
			AccountTypeID: sql.NullInt64{
				Valid: false,
			},
			AccountType: "",
		},
	}

	mockRepo.EXPECT().
		GetUserList(gomock.Any(), 10, 0).
		Return(users, nil).
		Times(1)

	mockRepo.EXPECT().
		CountUsers(gomock.Any()).
		Return(1, nil).
		Times(1)

	resp, err := userService.GetUserList(
		context.Background(), 10, 1,
	)

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if resp == nil || len(resp.Users) == 0 {
		t.Fatal("expected users in response, got none")
	}

	u := resp.Users[0]
	if u.AccountTypeID != nil {
		t.Errorf("expected nil AccountTypeID, got %v", u.AccountTypeID)
	}

	if u.AccountType != "Custom" {
		t.Errorf("expected AccountType Custom, got %s", u.AccountType)
	}
}
