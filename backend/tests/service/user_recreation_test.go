package service_test

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"go.uber.org/mock/gomock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestCreateUser_ReRegistration(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockRegRepo := mocks.NewMockRegistrationRepository(ctrl)
	mockCauRepo := mocks.NewMockClientAllowedUserRepository(ctrl)

	userService := service.NewUserService(
		mockUserRepo,
		mockClientRepo,
		mockRegRepo,
		mockCauRepo,
	)

	ctx := context.Background()
	email := "deleted@example.com"
	uID := uuid.New()
	
	req := dto.UserRequest{
		Email:      email,
		Password:   "newpassword123",
		FirstName:  "New",
		LastName:   "Name",
	}

	deletedUser := &models.User{
		ID:    uID[:],
		Email: email,
		Status: models.StatusDeleted,
		DeletedAt: sql.NullTime{
			Time:  time.Now(),
			Valid: true,
		},
	}

	t.Run("Successfully re-registers a deleted user", func(t *testing.T) {
		mockUserRepo.EXPECT().
			GetUserByEmailIncludeDeleted(ctx, email).
			Return(deletedUser, nil)
		
		mockUserRepo.EXPECT().
			ClearUserRelations(ctx, deletedUser.ID).
			Return(nil)
		
		mockUserRepo.EXPECT().
			RestoreUser(ctx, deletedUser.ID).
			Return(nil)
		
		mockUserRepo.EXPECT().
			UpdateUserName(ctx, gomock.Any()).
			Return(nil)
		
		mockUserRepo.EXPECT().
			UpdateUserPassword(ctx, gomock.Any()).
			Return(nil)
		
		mockUserRepo.EXPECT().
			UpdateUserRole(ctx, deletedUser.ID, gomock.Any()).
			Return(nil)

		id, err := userService.CreateUser(ctx, req)

		assert.NoError(t, err)
		assert.Equal(t, uID, id)
	})

	t.Run("Fails if user exists and is active", func(t *testing.T) {
		activeUser := &models.User{
			ID:    uID[:],
			Email: email,
			Status: models.StatusActive,
			DeletedAt: sql.NullTime{
				Valid: false,
			},
		}

		mockUserRepo.EXPECT().
			GetUserByEmailIncludeDeleted(ctx, email).
			Return(activeUser, nil)

		_, err := userService.CreateUser(ctx, req)

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "already exists")
	})
}
