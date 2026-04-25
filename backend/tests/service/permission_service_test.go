package service_test

import (
	"context"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"go.uber.org/mock/gomock"
)

/**
 * TestGetAllPermissions service test verifies logic for fetching all permissions.
 */
func TestGetAllPermissions(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockPermissionRepository(ctrl)
	permService := service.NewPermissionService(mockRepo)

	perms := []models.Permission{
		{ID: 1, PermissionName: "View all users"},
		{ID: 2, PermissionName: "Edit user"},
	}

	// 1. Setup mock expectations
	mockRepo.EXPECT().
		GetAllPermissions(gomock.Any()).
		Return(perms, nil)

	// 2. Execute
	resp, err := permService.GetAllPermissions(context.Background())

	// 3. Verify
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if len(resp) != 2 {
		t.Errorf("expected 2 permissions, got %d", len(resp))
	}

	if resp[0].Permission != perms[0].PermissionName {
		t.Errorf("expected %s, got %s", perms[0].PermissionName, resp[0].Permission)
	}
}
