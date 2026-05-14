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
	handler := v1.NewMFAHandler(mockMFAService, mockUserService)

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/mfa/setup", handler.GetTOTPSetup)

	mockUserService.EXPECT().GetUserByEmail(gomock.Any(), "test@example.com").
		Return(&dto.UserResponse{ID: uuid.New().String(), Email: "test@example.com"}, nil)

	mockMFAService.EXPECT().GenerateTOTPSetup(gomock.Any(), "test@example.com").
		Return("SECRET", "otpauth://...", nil)

	body, _ := json.Marshal(dto.TOTPSetupRequest{Email: "test@example.com"})
	req, _ := http.NewRequest("POST", "/mfa/setup", bytes.NewBuffer(body))
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
	handler := v1.NewMFAHandler(mockMFAService, mockUserService)

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/mfa/authenticators", handler.PostAuthenticator)

	mockUserService.EXPECT().GetUserByEmail(gomock.Any(), "test@example.com").
		Return(&dto.UserResponse{ID: uuid.New().String(), Email: "test@example.com"}, nil)

	mockMFAService.EXPECT().FinalizeTOTP(gomock.Any(), gomock.Any(), 
		"SECRET", "123456", "My Phone").
		Return([]string{"backup1"}, nil)
	
	body, _ := json.Marshal(dto.TOTPFinalizeRequest{
		Email:  "test@example.com",
		Secret: "SECRET",
		Code:   "123456",
		Name:   "My Phone",
	})
	req, _ := http.NewRequest("POST", "/mfa/authenticators", bytes.NewBuffer(body))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}
