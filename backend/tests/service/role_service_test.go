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
 * TestGetRoleByID verifies service logic for role retrieval.
 */
func TestGetRoleByID(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockRoleRepository(ctrl)
	roleService := service.NewRoleService(mockRepo)

	roleID := 1
	role := &models.Role{
		ID:          roleID,
		RoleName:    "Admin",
		Description: "Admin role",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// 1. Setup mock expectations
	mockRepo.EXPECT().
		GetByID(gomock.Any(), roleID).
		Return(role, nil)

	// 2. Execute
	resp, err := roleService.GetRoleByID(context.Background(), roleID)

	// 3. Verify
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if resp == nil {
		t.Fatal("expected response, got nil")
	}

	if resp.RoleName != role.RoleName {
		t.Errorf("expected name %s, got %s", role.RoleName, resp.RoleName)
	}
}
