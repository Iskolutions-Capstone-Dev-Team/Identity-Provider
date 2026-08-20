package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"go.uber.org/mock/gomock"
)

func TestGenerateSystemReport(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockClientRepo := mocks.NewMockClientRepository(ctrl)
	mockLogRepo := mocks.NewMockLogRepository(ctrl)

	reportService := service.NewReportService(
		mockUserRepo,
		mockClientRepo,
		mockLogRepo,
	)

	// Mock data
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
	permissions := []string{
		"View all users",
		"View all appclients",
		"View audit logs",
	}

	// 1. Success case - PDF format
	mockUserRepo.EXPECT().
		GetUserList(gomock.Any(), 10, 0, "created_at", "DESC").
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
		ctx, permissions, params,
	)
	if err != nil {
		t.Fatalf("unexpected error generating PDF report: %v", err)
	}
	if len(pdfBytes) == 0 {
		t.Error("expected non-empty PDF bytes")
	}

	// 2. Success case - JSON format
	mockUserRepo.EXPECT().
		GetUserList(gomock.Any(), 5, 0, "created_at", "DESC").
		Return(users, nil)

	mockClientRepo.EXPECT().
		ListClients(gomock.Any(), 5, 0, "", "client_name", "ASC").
		Return(clients, nil)

	mockLogRepo.EXPECT().
		GetLogList(gomock.Any(), 5, 0).
		Return(logs, nil)

	jsonParams := dto.SystemReportParams{
		IncludeUsers:   true,
		IncludeClients: true,
		IncludeLogs:    true,
		LimitUsers:     5,
		LimitClients:   5,
		LimitLogs:      5,
		Format:         "json",
	}

	jsonBytes, err := reportService.GenerateSystemReport(
		ctx, permissions, jsonParams,
	)
	if err != nil {
		t.Fatalf("unexpected error generating JSON report: %v", err)
	}
	if len(jsonBytes) == 0 {
		t.Error("expected non-empty JSON bytes")
	}
}
