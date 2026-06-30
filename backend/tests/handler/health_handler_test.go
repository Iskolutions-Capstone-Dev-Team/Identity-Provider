package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/gin-gonic/gin"
)

// TestHealthCheck verifies the root and v1 health endpoints.
func TestHealthCheck(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	h := api.Handlers{
		AuthHandler:         &v1.AuthHandler{},
		ClientHandler:       &v1.ClientHandler{},
		RoleHandler:         &v1.RoleHandler{},
		UserHandler:         &v1.UserHandler{},
		LogHandler:          &v1.LogHandler{},
		PermissionHandler:   &v1.PermissionHandler{},
		MailHandler:         &v1.MailHandler{},
		RegistrationHandler: &v1.RegistrationHandler{},
		OTPHandler:          &v1.OTPHandler{},
		MFAHandler:          &v1.MFAHandler{},
		PasskeyHandler:      &v1.PasskeyHandler{},
		MetricsHandler:      &v1.MetricsHandler{},
	}

	api.SetupRoutes(r, h)

	tests := []struct {
		name string
		path string
	}{
		{"root health", "/health"},
		{"v1 health", "/api/v1/health"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, err := http.NewRequest(http.MethodGet, tt.path, nil)
			if err != nil {
				t.Fatalf("failed to create request: %v", err)
			}

			r.ServeHTTP(w, req)

			if w.Code != http.StatusOK {
				t.Errorf("expected status 200, got %d", w.Code)
			}

			var body map[string]string
			if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
				t.Fatalf("failed to parse response body: %v", err)
			}

			if body["status"] != "healthy" {
				t.Errorf(
					"expected status 'healthy', got '%s'",
					body["status"],
				)
			}
		})
	}
}
