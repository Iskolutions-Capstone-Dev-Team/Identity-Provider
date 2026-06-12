package service_test

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/google/uuid"
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

	t.Run("extracts RPID from Origin header in BeginRegistration", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		os.Setenv("CLIENT_BASE_URL", "https://idp.example.com")

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

		userID := uuid.New()
		user := &dto.UserResponse{
			ID:        userID.String(),
			Email:     "user@example.com",
			FirstName: "Test",
			LastName:  "User",
		}
		mockUS.EXPECT().
			GetUserByEmail(gomock.Any(), "user@example.com").
			Return(user, nil).
			Times(1)

		mockPR.EXPECT().
			GetPasskeysByUserID(gomock.Any(), gomock.Any()).
			Return(nil, nil).
			Times(1)

		req, _ := http.NewRequest("POST", "/register", nil)
		req.Header.Set("Origin", "https://custom-origin.com:8080")

		challenge, err := svc.BeginRegistration(
			context.Background(), "user@example.com", false, req,
		)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		var challengeMap map[string]any
		if err := json.Unmarshal(challenge, &challengeMap); err != nil {
			t.Fatalf("failed to unmarshal challenge: %v", err)
		}

		publicKey, ok := challengeMap["publicKey"].(map[string]any)
		if !ok {
			t.Fatal("publicKey object not found in challenge")
		}

		rp, ok := publicKey["rp"].(map[string]any)
		if !ok {
			t.Fatal("rp object not found in challenge")
		}

		rpID, _ := rp["id"].(string)
		if rpID != "custom-origin.com" {
			t.Errorf("expected rp ID to be custom-origin.com, got %s", rpID)
		}
	})
}
