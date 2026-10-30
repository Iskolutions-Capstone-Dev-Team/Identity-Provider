package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

func TestGenerateSystemReport_ViewAllUsers(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockLogRepo := mocks.NewMockLogRepository(ctrl)

	reportService := service.NewReportService(
		mockUserRepo,
		mockClientRepo,
		mockLogRepo,
		nil,
	)

	users := []models.User{
		{
			FirstName: "Alice",
			LastName:  "Smith",
			Email:     "alice@example.com",
			Status:    models.StatusActive,
			CreatedAt: time.Now(),
		},
	}

	clients := []models.Client{
		{
			ClientName:      "App1",
			BaseUrl:         "http://app1.local",
			AccessTokenTTL:  3600,
			RefreshTokenTTL: 86400,
			Grants:          []string{"authorization_code"},
		},
	}

	actor := "alice@example.com"
	logs := []models.AuditLog{
		{
			Actor:     &actor,
			Action:    "login",
			Target:    "app1",
			Status:    "success",
			CreatedAt: time.Now(),
		},
	}

	ctx := context.Background()
	userID := uuid.New()
	permissions := []string{
		"View all users",
		"View all appclients",
		"View audit logs",
	}

	mockUserRepo.EXPECT().
		GetUserList(gomock.Any(), 10, 0, "created_at", "DESC", "").
		Return(users, nil)

	mockClientRepo.EXPECT().
		ListClients(gomock.Any(), 10, 0, "", "client_name", "ASC").
		Return(clients, nil)

	mockLogRepo.EXPECT().
		GetLogList(gomock.Any(), 10, 0).
		Return(logs, nil)

	params := dto.SystemReportParams{
		IncludeUsers:   true,
		IncludeClients: true,
		IncludeLogs:    true,
		LimitUsers:     10,
		LimitClients:   10,
		LimitLogs:      10,
		Format:         "pdf",
	}

	pdfBytes, err := reportService.GenerateSystemReport(
		ctx, permissions, userID, params,
	)
	if err != nil {
		t.Fatalf("unexpected error generating PDF report: %v", err)
	}
	if len(pdfBytes) == 0 {
		t.Error("expected non-empty PDF bytes")
	}
}

func TestGenerateSystemReport_ViewUsersBasedOnAppClient(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockLogRepo := mocks.NewMockLogRepository(ctrl)

	reportService := service.NewReportService(
		mockUserRepo,
		mockClientRepo,
		mockLogRepo,
		nil,
	)

	users := []models.User{
		{
			FirstName: "Bob",
			LastName:  "Jones",
			Email:     "bob@example.com",
			Status:    models.StatusActive,
			CreatedAt: time.Now(),
		},
	}

	ctx := context.Background()
	userID := uuid.New()
	permissions := []string{
		"View users based on appclient",
	}

	mockUserRepo.EXPECT().
		GetBoundUserList(
			gomock.Any(), 5, 0, userID[:], "created_at", "DESC", "",
		).
		Return(users, nil)

	params := dto.SystemReportParams{
		IncludeUsers: true,
		LimitUsers:   5,
		Format:       "json",
	}

	jsonBytes, err := reportService.GenerateSystemReport(
		ctx, permissions, userID, params,
	)
	if err != nil {
		t.Fatalf("unexpected error generating JSON report: %v", err)
	}
	if len(jsonBytes) == 0 {
		t.Error("expected non-empty JSON bytes")
	}
}

func TestGenerateSummaryReport_ViewAllUsers(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockLogRepo := mocks.NewMockLogRepository(ctrl)
	mockMetricsRepo := mocks.NewMockMetricsRepository(ctrl)

	reportService := service.NewReportService(
		mockUserRepo,
		mockClientRepo,
		mockLogRepo,
		mockMetricsRepo,
	)

	ctx := context.Background()
	userID := uuid.New()
	permissions := []string{"View all users", "View all appclients"}

	mockMetricsRepo.EXPECT().
		GetUserMetrics(gomock.Any(), nil).
		Return([]models.MetricCard{
			{Title: "Total Users", Value: "100"},
			{Title: "Active Users", Value: "90"},
		}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetRoleMetrics(gomock.Any()).
		Return([]models.MetricCard{
			{Title: "Total Roles", Value: "5"},
		}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetPermissionMetrics(gomock.Any()).
		Return([]models.MetricCard{
			{Title: "Total Permissions", Value: "20"},
		}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetClientMetrics(gomock.Any(), nil).
		Return([]models.MetricCard{
			{Title: "Total Clients", Value: "3"},
		}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetLogMetrics(gomock.Any(), true, true).
		Return([]models.MetricCard{
			{Title: "Audit Logs", Value: "50"},
		}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetTotalLogins(
		gomock.Any(), gomock.Any(), nil,
	).Return(200, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetFailedAuthAttempts(
		gomock.Any(), gomock.Any(), nil,
	).Return([]models.FailedAuthAttempt{}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetTopClients(
		gomock.Any(), 10, gomock.Any(), nil,
	).Return([]models.TopClientLogin{
		{ClientName: "One-Portal", LoginCount: 150},
	}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetTargetedClientFailures(
		gomock.Any(), 5, gomock.Any(), nil,
	).Return([]models.TargetedClientFailure{}, nil).AnyTimes()

	jsonParams := dto.SummaryReportParams{
		TimeFrame: "24h",
		Format:    "json",
	}

	jsonBytes, err := reportService.GenerateSummaryReport(
		ctx, permissions, userID, jsonParams,
	)
	if err != nil {
		t.Fatalf("unexpected error generating JSON summary: %v", err)
	}
	if len(jsonBytes) == 0 {
		t.Error("expected non-empty JSON summary bytes")
	}
}

func TestGenerateSummaryReport_ViewUsersBasedOnAppClient(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockLogRepo := mocks.NewMockLogRepository(ctrl)
	mockMetricsRepo := mocks.NewMockMetricsRepository(ctrl)

	reportService := service.NewReportService(
		mockUserRepo,
		mockClientRepo,
		mockLogRepo,
		mockMetricsRepo,
	)

	ctx := context.Background()
	userID := uuid.New()
	permissions := []string{"View users based on appclient"}

	mockMetricsRepo.EXPECT().
		GetBoundClientIDs(gomock.Any(), userID[:]).
		Return([]string{"client-1"}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().
		GetUserMetrics(gomock.Any(), userID[:]).
		Return([]models.MetricCard{
			{Title: "Total Users", Value: "15"},
			{Title: "Active Users", Value: "12"},
		}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetRoleMetrics(gomock.Any()).
		Return([]models.MetricCard{}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetPermissionMetrics(gomock.Any()).
		Return([]models.MetricCard{}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetClientMetrics(
		gomock.Any(), []string{"client-1"},
	).Return([]models.MetricCard{}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetLogMetrics(gomock.Any(), true, true).
		Return([]models.MetricCard{}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetTotalLogins(
		gomock.Any(), gomock.Any(), []string{"client-1"},
	).Return(50, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetFailedAuthAttempts(
		gomock.Any(), gomock.Any(), []string{"client-1"},
	).Return([]models.FailedAuthAttempt{}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetTopClients(
		gomock.Any(), 10, gomock.Any(), []string{"client-1"},
	).Return([]models.TopClientLogin{}, nil).AnyTimes()

	mockMetricsRepo.EXPECT().GetTargetedClientFailures(
		gomock.Any(), 5, gomock.Any(), []string{"client-1"},
	).Return([]models.TargetedClientFailure{}, nil).AnyTimes()

	pdfParams := dto.SummaryReportParams{
		TimeFrame: "24h",
		Format:    "pdf",
	}

	pdfBytes, err := reportService.GenerateSummaryReport(
		ctx, permissions, userID, pdfParams,
	)
	if err != nil {
		t.Fatalf("unexpected error generating PDF summary: %v", err)
	}
	if len(pdfBytes) == 0 {
		t.Error("expected non-empty PDF summary bytes")
	}
}
