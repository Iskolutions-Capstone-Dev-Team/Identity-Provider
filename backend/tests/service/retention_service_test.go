package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
)

func TestExecuteRetention_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRetentionRepo := mocks.NewMockRetentionRepository(ctrl)
	mockLogRepo := mocks.NewMockLogRepository(ctrl)

	// We pass nil for storage provider in unit test, which logs a warning and proceeds to purge
	retentionService := service.NewRetentionService(mockRetentionRepo, mockLogRepo, nil)
	ctx := context.Background()

	actor := "old_user@example.com"
	oldLog := models.AuditLog{
		ID:        5,
		Actor:     &actor,
		Action:    "login",
		Target:    "system",
		Status:    "success",
		Metadata:  []byte(`{}`),
		CreatedAt: time.Now().AddDate(-1, -3, 0), // 15 months ago
	}

	// 1. Audit logs stream & purge
	mockRetentionRepo.EXPECT().
		StreamLogsOlderThan(gomock.Any(), "audit_logs", gomock.Any(), gomock.Any()).
		DoAndReturn(func(ctx context.Context, table string, cutoff time.Time, fn func(entry models.AuditLog) error) (int64, error) {
			_ = fn(oldLog)
			return 1, nil
		})

	mockRetentionRepo.EXPECT().
		BatchDeleteLogsOlderThan(gomock.Any(), "audit_logs", gomock.Any(), 1000).
		Return(int64(1), nil)

	// 2. Security logs stream & purge (simulate 0 rows)
	mockRetentionRepo.EXPECT().
		StreamLogsOlderThan(gomock.Any(), "security_logs", gomock.Any(), gomock.Any()).
		Return(int64(0), nil)

	// 3. Log audit event
	mockLogRepo.EXPECT().
		CreateLog(gomock.Any(), gomock.Any()).
		Return(nil)

	resp, err := retentionService.ExecuteRetention(ctx)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.Equal(t, "completed", resp.Status)
	assert.Equal(t, int64(1), resp.AuditLogsArchived)
	assert.Equal(t, int64(1), resp.AuditLogsPurged)
	assert.Equal(t, int64(0), resp.SecurityLogsArchived)
	assert.Equal(t, int64(0), resp.SecurityLogsPurged)
	assert.NotEmpty(t, resp.CutoffDate)
}

