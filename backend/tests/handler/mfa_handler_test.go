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
	r.Use(func(c *gin.Context) {
		c.Set("user_id", uuid.New().String())
		c.Next()
	})
	r.GET("/mfa/setup", handler.GetTOTPSetup)

	mockUserService.EXPECT().GetUserByID(gomock.Any(), gomock.Any()).
		Return(&dto.UserResponse{Email: "test@example.com"}, nil)

	mockMFAService.EXPECT().GenerateTOTPSetup(gomock.Any(), "test@example.com").
		Return("SECRET", "otpauth://...", nil)

	req, _ := http.NewRequest("GET", "/mfa/setup", nil)
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
	r.Use(func(c *gin.Context) {
		c.Set("user_id", uuid.New().String())
		c.Next()
	})
	r.POST("/mfa/authenticators", handler.PostAuthenticator)

	mockMFAService.EXPECT().FinalizeTOTP(gomock.Any(), gomock.Any(), 
		"SECRET", "123456", "My Phone").
		Return([]string{"backup1"}, nil)
	
	mockUserService.EXPECT().GetUserByID(gomock.Any(), gomock.Any()).
		Return(&dto.UserResponse{Email: "test@example.com"}, nil)

	body, _ := json.Marshal(dto.TOTPFinalizeRequest{
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
