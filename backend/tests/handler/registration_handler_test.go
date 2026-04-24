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
 * TestCheckInvitationHandler verifies the GET /activate/:code endpoint.
 */
func TestCheckInvitationHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRegService := mocks.NewMockRegistrationService(ctrl)
	mockLogService := mocks.NewMockLogService(ctrl)

	handler := &v1.RegistrationHandler{
		Service:    mockRegService,
		LogService: mockLogService,
	}

	code := "valid-code"

	// 1. Setup mock expectations
	mockRegService.EXPECT().
		CheckInvitation(gomock.Any(), code).
		Return(true, nil)

	mockLogService.EXPECT().
		PostAuditLogWithActorString(gomock.Any(), code, gomock.Any()).
		Return(nil).
		AnyTimes()

	mockLogService.EXPECT().
		PostSecurityLogWithActorString(gomock.Any(), code, gomock.Any()).
		Return(nil).
		AnyTimes()

	// 2. Create context and request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	
	c.Params = []gin.Param{{Key: "code", Value: code}}
	c.Request, _ = http.NewRequest("GET", "/activate/"+code, nil)

	// 3. Execute
	handler.CheckInvitation(c)

	// 4. Verify results
	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resp dto.SuccessResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	if resp.Message != "invitation code is valid" {
		t.Errorf("expected message 'invitation code is valid', got '%s'", resp.Message)
	}
}
