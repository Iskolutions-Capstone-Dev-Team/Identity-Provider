package service_test

import (
	"context"
	"testing"

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
	)

	userID := uuid.New()
	user := &models.User{
		ID:    userID[:],
		Email: "test@example.com",
	}

	// 1. Setup mock expectation: Repository should be called once.
	mockRepo.EXPECT().
		GetUserById(gomock.Any(), userID[:]).
		Return(user, nil).
		Times(1)

	// 2. Execute service call
	resp, err := userService.GetUserByID(context.Background(), userID)

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
