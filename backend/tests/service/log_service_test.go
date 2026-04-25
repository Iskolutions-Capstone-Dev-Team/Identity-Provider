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
 * TestGetLogListWithFilters service test verifies audit log retrieval.
 */
func TestGetLogListWithFilters(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockLogRepository(ctrl)
	logService := service.NewLogService(mockRepo)

	filters := map[string]interface{}{"status": "success"}
	actor := "test@example.com"
	logs := []models.AuditLog{
		{ID: 1, Actor: &actor, Action: "login", Target: "client-1", Status: "success", Metadata: []byte("{}")},
	}

	// 1. Setup mock expectations
	mockRepo.EXPECT().
		GetLogListWithFilters(gomock.Any(), filters, 10, 0).
		Return(logs, int64(1), nil)

	// 2. Execute
	resp, total, lastPage, err := logService.GetLogListWithFilters(context.Background(), filters, 10, 1)

	// 3. Verify
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if total != 1 {
		t.Errorf("expected total 1, got %d", total)
	}

	if lastPage != 1 {
		t.Errorf("expected lastPage 1, got %d", lastPage)
	}

	if *resp[0].Actor != actor {
		t.Errorf("expected actor %s, got %s", actor, *resp[0].Actor)
	}
}
