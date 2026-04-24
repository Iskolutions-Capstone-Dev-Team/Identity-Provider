package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/gin-gonic/gin"
	"go.uber.org/mock/gomock"
)

/**
 * TestGetLogListHandler verifies the GET /logs endpoint.
 */
func TestGetLogListHandler(t *testing.T) {
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

	// 1. Setup mock expectations
	mockLogService.EXPECT().
		GetLogListWithFilters(gomock.Any(), gomock.Any(), 10, 1).
		Return(logs, int64(1), 1, nil)

	// 2. Create context and request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request, _ = http.NewRequest("GET", "/logs?limit=10&page=1", nil)
	c.Set("permissions", []string{"View audit logs"})

	// 3. Execute
	handler.GetLogList(c)

	// 4. Verify results
	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resp dto.GetAuditLogListResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	if resp.TotalCount != 1 {
		t.Errorf("expected total 1, got %d", resp.TotalCount)
	}
}
