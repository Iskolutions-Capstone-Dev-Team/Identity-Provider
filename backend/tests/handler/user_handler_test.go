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
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

/**
 * TestGetUserHandler verifies the GET /users/:id endpoint.
 */
func TestGetUserHandler(t *testing.T) {
	// Set Gin to Test Mode
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockService := mocks.NewMockUserService(ctrl)
	mockLogService := mocks.NewMockLogService(ctrl)
	mockClientService := mocks.NewMockClientService(ctrl)
	mockAccessService := mocks.NewMockClientAllowedUserService(ctrl)

	handler := &v1.UserHandler{
		Service:       mockService,
		LogService:    mockLogService,
		ClientService: mockClientService,
		AccessService: mockAccessService,
	}

	userID := uuid.New()
	userResp := &dto.UserResponse{
		ID:    userID.String(),
		Email: "test@example.com",
	}

	// 1. Setup mock expectations
	mockService.EXPECT().
		GetUserByID(gomock.Any(), userID).
		Return(userResp, nil)

	// UserHandler also calls LogService for audit logs
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
	
	c.Params = []gin.Param{{Key: "id", Value: userID.String()}}
	c.Set("user_id", uuid.New().String()) // Actor ID
	c.Request, _ = http.NewRequest("GET", "/users/"+userID.String(), nil)

	// 3. Execute
	handler.GetUser(c)

	// 4. Verify results
	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resp dto.UserResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Errorf("failed to unmarshal response: %v", err)
	}

	if resp.Email != userResp.Email {
		t.Errorf("expected email %s, got %s", userResp.Email, resp.Email)
	}
}
