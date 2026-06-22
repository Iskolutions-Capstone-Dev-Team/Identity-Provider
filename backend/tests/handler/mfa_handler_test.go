package handler_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	v1 "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

func TestGetTOTPSetupHandler(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockMFAService := mocks.NewMockMFAService(ctrl)
	mockUserService := mocks.NewMockUserService(ctrl)
	mockAuthService := mocks.NewMockAuthService(ctrl)
	handler := v1.NewMFAHandler(
		mockMFAService,
		mockUserService,
		mockAuthService,
	)

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/mfa/setup", handler.GetTOTPSetup)

	mockUserService.EXPECT().GetUserByEmail(gomock.Any(), "test@example.com").
		Return(&dto.UserResponse{ID: uuid.New().String(), Email: "test@example.com"}, nil)

	mockMFAService.EXPECT().GenerateTOTPSetup(gomock.Any(), "test@example.com").
		Return("SECRET", "otpauth://...", nil)

	req, _ := http.NewRequest("GET", "/mfa/setup?email=test@example.com", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}

func TestPostAuthenticatorHandler(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockMFAService := mocks.NewMockMFAService(ctrl)
	mockUserService := mocks.NewMockUserService(ctrl)
	mockAuthService := mocks.NewMockAuthService(ctrl)
	handler := v1.NewMFAHandler(
		mockMFAService,
		mockUserService,
		mockAuthService,
	)

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/mfa/authenticators", handler.PostAuthenticator)

	mockUserUUID := uuid.New()

	mockAuthService.EXPECT().
		CheckSessionOrPendingMFA(gomock.Any()).
		Return(mockUserUUID, false, func() {}, nil)

	mockUserService.EXPECT().
		GetUserByEmail(gomock.Any(), "test@example.com").
		Return(&dto.UserResponse{
			ID:    mockUserUUID.String(),
			Email: "test@example.com",
		}, nil)

	mockMFAService.EXPECT().FinalizeTOTP(gomock.Any(), gomock.Any(),
		"SECRET", "123456", "My Phone").
		Return([]string{"backup1"}, nil)

	body, _ := json.Marshal(dto.TOTPFinalizeRequest{
		Email:  "test@example.com",
		Secret: "SECRET",
		Code:   "123456",
		Name:   "My Phone",
	})
	req, _ := http.NewRequest(
		"POST", "/mfa/authenticators", bytes.NewBuffer(body),
	)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}

func TestGetAuthenticatorListHandler(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockMFAService := mocks.NewMockMFAService(ctrl)
	mockUserService := mocks.NewMockUserService(ctrl)
	mockAuthService := mocks.NewMockAuthService(ctrl)
	handler := v1.NewMFAHandler(
		mockMFAService,
		mockUserService,
		mockAuthService,
	)

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/mfa/authenticators/list", handler.GetAuthenticatorList)

	mockUserService.EXPECT().GetUserByEmail(gomock.Any(), "test@example.com").
		Return(&dto.UserResponse{ID: uuid.New().String(), Email: "test@example.com"}, nil)

	mockMFAService.EXPECT().GetAuthenticatorList(gomock.Any(), gomock.Any()).
		Return(nil, nil)

	req, _ := http.NewRequest("GET", "/mfa/authenticators/list?email=test@example.com", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}

/**
 * TestGetHasTOTPHandler verifies the GET /mfa/totp/exists endpoint.
 */
func TestGetHasTOTPHandler(t *testing.T) {
	t.Run("returns has_totp true when TOTP exists", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockMFAService := mocks.NewMockMFAService(ctrl)
		mockUserService := mocks.NewMockUserService(ctrl)
		mockAuthService := mocks.NewMockAuthService(ctrl)
		handler := v1.NewMFAHandler(
			mockMFAService,
			mockUserService,
			mockAuthService,
		)

		gin.SetMode(gin.TestMode)
		r := gin.New()
		r.GET("/mfa/totp/exists", handler.GetHasTOTP)

		mockUserService.EXPECT().
			GetUserByEmail(gomock.Any(), "test@example.com").
			Return(&dto.UserResponse{
				ID:    uuid.New().String(),
				Email: "test@example.com",
			}, nil)

		mockMFAService.EXPECT().
			HasTOTP(gomock.Any(), gomock.Any()).
			Return(true, nil)

		req, _ := http.NewRequest(
			"GET", "/mfa/totp/exists?email=test@example.com", nil,
		)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}

		var body map[string]bool
		if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}
		if !body["has_totp"] {
			t.Errorf("expected has_totp=true, got %v", body)
		}
	})

	t.Run("returns 400 when email is missing", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockMFAService := mocks.NewMockMFAService(ctrl)
		mockUserService := mocks.NewMockUserService(ctrl)
		mockAuthService := mocks.NewMockAuthService(ctrl)
		handler := v1.NewMFAHandler(
			mockMFAService,
			mockUserService,
			mockAuthService,
		)

		gin.SetMode(gin.TestMode)
		r := gin.New()
		r.GET("/mfa/totp/exists", handler.GetHasTOTP)

		req, _ := http.NewRequest("GET", "/mfa/totp/exists", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d", w.Code)
		}
	})
}

/**
 * TestGetHasPasskeyHandler verifies the GET /mfa/passkey/exists endpoint.
 */
func TestGetHasPasskeyHandler(t *testing.T) {
	t.Run("returns has_passkey false when none registered", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockPasskeyService := mocks.NewMockPasskeyService(ctrl)
		mockUserService := mocks.NewMockUserService(ctrl)
		mockAuthService := mocks.NewMockAuthService(ctrl)
		handler := v1.NewPasskeyHandler(
			mockPasskeyService,
			mockUserService,
			mockAuthService,
		)

		gin.SetMode(gin.TestMode)
		r := gin.New()
		r.GET("/mfa/passkey/exists", handler.GetHasPasskey)

		mockPasskeyService.EXPECT().
			HasPasskey(gomock.Any(), "test@example.com").
			Return(false, nil)

		req, _ := http.NewRequest(
			"GET", "/mfa/passkey/exists?email=test@example.com", nil,
		)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}

		var body map[string]bool
		if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}
		if body["has_passkey"] {
			t.Errorf("expected has_passkey=false, got %v", body)
		}
	})

	t.Run("returns 400 when email is missing", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockPasskeyService := mocks.NewMockPasskeyService(ctrl)
		mockUserService := mocks.NewMockUserService(ctrl)
		mockAuthService := mocks.NewMockAuthService(ctrl)
		handler := v1.NewPasskeyHandler(
			mockPasskeyService,
			mockUserService,
			mockAuthService,
		)

		gin.SetMode(gin.TestMode)
		r := gin.New()
		r.GET("/mfa/passkey/exists", handler.GetHasPasskey)

		req, _ := http.NewRequest("GET", "/mfa/passkey/exists", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d", w.Code)
		}
	})
}
