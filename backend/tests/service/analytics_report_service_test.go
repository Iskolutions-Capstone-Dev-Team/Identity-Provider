package service_test

import (
	"bytes"
	"context"
	"strings"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
)

func TestGetAnalyticsReport_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockReportRepo := mocks.NewMockReportRepository(ctrl)
	reportService := service.NewReportService(nil, nil, nil, nil, mockReportRepo)

	ctx := context.Background()
	query := dto.AnalyticsReportQuery{
		From: "2026-01-01",
		To:   "2026-11-01",
		Type: "all",
	}

	expectedSummary := &dto.AnalyticsKPISummary{
		TotalEvents:        1500,
		SuccessEvents:      1400,
		FailedEvents:       100,
		FailureRatePercent: 6.67,
		UniqueActors:       45,
		TopActions: []dto.ActionCountMetric{
			{Action: "login", Count: 1200},
		},
	}

	expectedTimeseries := []dto.TimeseriesPoint{
		{Bucket: "2026-01", Total: 150, Success: 140, Fail: 10},
		{Bucket: "2026-02", Total: 160, Success: 150, Fail: 10},
	}

	mockReportRepo.EXPECT().
		GetAggregatedKPIs(gomock.Any(), gomock.Any(), gomock.Any(), "all").
		Return(expectedSummary, nil)

	mockReportRepo.EXPECT().
		GetTimeseries(gomock.Any(), gomock.Any(), gomock.Any(), "month", "all").
		Return(expectedTimeseries, nil)

	resp, err := reportService.GetAnalyticsReport(ctx, query)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.Equal(t, "month", resp.Interval)
	assert.Equal(t, int64(1500), resp.Summary.TotalEvents)
	assert.Equal(t, 2, len(resp.Timeseries))
}

func TestGetAnalyticsReport_Validations(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockReportRepo := mocks.NewMockReportRepository(ctrl)
	reportService := service.NewReportService(nil, nil, nil, nil, mockReportRepo)
	ctx := context.Background()

	t.Run("Invalid from format", func(t *testing.T) {
		_, err := reportService.GetAnalyticsReport(ctx, dto.AnalyticsReportQuery{
			From: "not-a-date",
			To:   "2026-05-01",
		})
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid date format")
	})

	t.Run("From after To", func(t *testing.T) {
		_, err := reportService.GetAnalyticsReport(ctx, dto.AnalyticsReportQuery{
			From: "2026-06-01",
			To:   "2026-01-01",
		})
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "from date cannot be after to date")
	})

	t.Run("Exceeds 366 days", func(t *testing.T) {
		_, err := reportService.GetAnalyticsReport(ctx, dto.AnalyticsReportQuery{
			From: "2024-01-01",
			To:   "2026-01-01",
		})
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "cannot exceed 366 days")
	})

	t.Run("Invalid type", func(t *testing.T) {
		_, err := reportService.GetAnalyticsReport(ctx, dto.AnalyticsReportQuery{
			From: "2026-01-01",
			To:   "2026-02-01",
			Type: "invalid-type",
		})
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid type")
	})
}

func TestStreamExportCSV(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockReportRepo := mocks.NewMockReportRepository(ctrl)
	reportService := service.NewReportService(nil, nil, nil, nil, mockReportRepo)
	ctx := context.Background()

	query := dto.ReportExportQuery{
		From: "2026-01-01",
		To:   "2026-01-31",
		Type: "audit",
	}

	actor := "admin@example.com"
	sampleLog := models.AuditLog{
		ID:        101,
		Actor:     &actor,
		Action:    "user_login",
		Target:    "dashboard",
		Status:    "success",
		Metadata:  []byte(`{"ip":"127.0.0.1"}`),
		CreatedAt: time.Date(2026, 1, 15, 10, 0, 0, 0, time.UTC),
	}

	mockReportRepo.EXPECT().
		StreamLogs(gomock.Any(), gomock.Any(), gomock.Any(), "audit", gomock.Any()).
		DoAndReturn(func(ctx context.Context, from, to time.Time, logType string, fn func(entry models.AuditLog, entryType string) error) error {
			return fn(sampleLog, "audit")
		})

	var buf bytes.Buffer
	err := reportService.StreamExportCSV(ctx, query, &buf)
	assert.NoError(t, err)

	content := buf.String()
	assert.True(t, strings.HasPrefix(content, "ID,Type,Actor,Action,Target,Status,Timestamp,Metadata"))
	assert.Contains(t, content, "101,audit,admin@example.com,user_login,dashboard,success")
}

