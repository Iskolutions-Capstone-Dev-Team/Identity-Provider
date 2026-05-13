package handler_test

import (
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

	mockUserService.EXPECT().GetUserByID(gomock.Any(), gomock.Any()).
		Return(&dto.UserResponse{Email: "test@example.com"}, nil)

	mockMFAService.EXPECT().SetupTOTP(gomock.Any(), gomock.Any(), 
		"test@example.com").
		Return("otpauth://...", []string{"code1"}, nil)

	req, _ := http.NewRequest("POST", "/mfa/authenticators", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["otpauth_uri"] != "otpauth://..." {
		t.Error("Incorrect OTPAuth URI in response")
	}
}
