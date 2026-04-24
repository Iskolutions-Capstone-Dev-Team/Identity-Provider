package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

/**
 * TestGetRoleHandler verifies the GET /admin/roles/:id endpoint.
 */
func TestGetRoleHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRoleService := mocks.NewMockRoleService(ctrl)
	mockLogService := mocks.NewMockLogService(ctrl)

	handler := &v1.RoleHandler{
		Service:    mockRoleService,
		LogService: mockLogService,
	}

	roleID := 1
	roleResp := &dto.RoleResponse{
		ID:       roleID,
		RoleName: "Admin",
	}

	// 1. Setup mock expectations
	mockRoleService.EXPECT().
		GetRoleByID(gomock.Any(), roleID).
		Return(roleResp, nil)

	mockLogService.EXPECT().
		GetUserEmail(gomock.Any(), gomock.Any()).
		Return("admin@example.com", nil).
		AnyTimes()

	mockLogService.EXPECT().
		PostAuditLogWithActorString(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(nil).
		AnyTimes()

	// 2. Create context and request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Params = []gin.Param{{Key: "id", Value: strconv.Itoa(roleID)}}
	c.Set("user_id", uuid.New().String())
	c.Request, _ = http.NewRequest("GET", "/admin/roles/1", nil)

	// 3. Execute
	handler.GetRole(c)

	// 4. Verify results
	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resp dto.RoleResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Errorf("failed to unmarshal response: %v", err)
	}

	if resp.RoleName != roleResp.RoleName {
		t.Errorf("expected name %s, got %s", roleResp.RoleName, resp.RoleName)
	}
}
