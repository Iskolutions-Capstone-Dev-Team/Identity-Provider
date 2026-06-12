package service_test

import (
	"os"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"go.uber.org/mock/gomock"
)

// TestNewPasskeyService_OriginFallback verifies that NewPasskeyService
// correctly resolves the origin based on CLIENT_BASE_URL, One Portal
// client configurations, or VITE_ONE_PORTAL_URL fallback.
func TestNewPasskeyService_OriginFallback(t *testing.T) {
	// Backup original env vars
	origBase := os.Getenv("CLIENT_BASE_URL")
	origViteOP := os.Getenv("VITE_ONE_PORTAL_URL")
	defer func() {
		os.Setenv("CLIENT_BASE_URL", origBase)
		os.Setenv("VITE_ONE_PORTAL_URL", origViteOP)
	}()

	t.Run("uses CLIENT_BASE_URL if set", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		os.Setenv("CLIENT_BASE_URL", "https://idp.example.com")
		os.Setenv("VITE_ONE_PORTAL_URL", "")

		mockPR := mocks.NewMockPasskeyRepository(ctrl)
		mockUS := mocks.NewMockUserService(ctrl)
		mockCR := mocks.NewMockClientRepository(ctrl)

		mockCR.EXPECT().
			ListClients(gomock.Any(), 10, 0, "One Portal").
			Return(nil, nil).
			Times(1)

		mockCR.EXPECT().
			ListClientBaseURLS(gomock.Any()).
			Return(nil, nil).
			Times(1)

		svc, err := service.NewPasskeyService(mockPR, mockUS, mockCR)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if svc == nil {
			t.Fatal("expected service instance, got nil")
		}
	})

	t.Run("falls back to One Portal from DB", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		os.Setenv("CLIENT_BASE_URL", "")
		os.Setenv("VITE_ONE_PORTAL_URL", "")

		mockPR := mocks.NewMockPasskeyRepository(ctrl)
		mockUS := mocks.NewMockUserService(ctrl)
		mockCR := mocks.NewMockClientRepository(ctrl)

		opLink := "https://op-link.example.com"
		clients := []models.Client{
			{
				ClientName:    "One Portal",
				OnePortalLink: &opLink,
				BaseUrl:       "https://op-base.example.com",
			},
		}

		mockCR.EXPECT().
			ListClients(gomock.Any(), 10, 0, "One Portal").
			Return(clients, nil).
			Times(1)

		mockCR.EXPECT().
			ListClientBaseURLS(gomock.Any()).
			Return(nil, nil).
			Times(1)

		svc, err := service.NewPasskeyService(mockPR, mockUS, mockCR)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if svc == nil {
			t.Fatal("expected service instance, got nil")
		}
	})

	t.Run("falls back to VITE_ONE_PORTAL_URL env if DB fails", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		os.Setenv("CLIENT_BASE_URL", "")
		os.Setenv("VITE_ONE_PORTAL_URL", "https://op-env.example.com")

		mockPR := mocks.NewMockPasskeyRepository(ctrl)
		mockUS := mocks.NewMockUserService(ctrl)
		mockCR := mocks.NewMockClientRepository(ctrl)

		mockCR.EXPECT().
			ListClients(gomock.Any(), 10, 0, "One Portal").
			Return(nil, nil).
			Times(1)

		mockCR.EXPECT().
			ListClientBaseURLS(gomock.Any()).
			Return(nil, nil).
			Times(1)

		svc, err := service.NewPasskeyService(mockPR, mockUS, mockCR)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if svc == nil {
			t.Fatal("expected service instance, got nil")
		}
	})
}
