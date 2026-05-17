package handler_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/gin-gonic/gin"
	"go.uber.org/mock/gomock"
)

func TestGetSecurityLogListHandler_Unauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockLogService := mocks.NewMockLogService(ctrl)
	handler := &v1.LogHandler{
		LogService: mockLogService,
	}

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request, _ = http.NewRequest("GET", "/logs/security", nil)
	// User only has "View audit logs" but NOT "View security logs"
	c.Set("permissions", []string{"View audit logs"})

	handler.GetSecurityLogList(c)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", w.Code)
	}
}

func TestGetSecurityLogListHandler_Authorized(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockLogService := mocks.NewMockLogService(ctrl)
	handler := &v1.LogHandler{
		LogService: mockLogService,
	}

	actor := "test@example.com"
	logs := []dto.PostAuditLogRequest{
		{Actor: &actor, Action: "login", Status: "success"},
	}

	mockLogService.EXPECT().
		GetSecurityLogListWithFilters(gomock.Any(), gomock.Any(), 10, 1).
		Return(logs, int64(1), 1, nil)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request, _ = http.NewRequest("GET", "/logs/security", nil)
	c.Set("permissions", []string{"View security logs"})

	handler.GetSecurityLogList(c)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}
}

func TestGetSecurityLogHandler_Unauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockLogService := mocks.NewMockLogService(ctrl)
	handler := &v1.LogHandler{
		LogService: mockLogService,
	}

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Params = []gin.Param{{Key: "id", Value: "1"}}
	c.Request, _ = http.NewRequest("GET", "/logs/security/1", nil)
	c.Set("permissions", []string{"View audit logs"})

	handler.GetSecurityLog(c)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", w.Code)
	}
}
