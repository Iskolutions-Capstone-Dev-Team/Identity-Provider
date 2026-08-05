package handler_test

import (
	"bytes"
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
		GetUserByID(gomock.Any(), userID, gomock.Any(), gomock.Any()).
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

func TestPutAdminAccessHandler(t *testing.T) {
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
	targetEmail := "target@example.com"
	clientIDs := []string{uuid.New().String()}

	mockLogService.EXPECT().
		GetUserEmail(gomock.Any(), gomock.Any()).
		Return("admin@example.com", nil).
		AnyTimes()

	mockService.EXPECT().
		GetUserByID(gomock.Any(), userID, gomock.Any(), gomock.Any()).
		Return(&dto.UserResponse{Email: targetEmail}, nil).
		Times(1)

	mockService.EXPECT().
		SyncAdminClientAccess(gomock.Any(), userID, clientIDs).
		Return(nil).
		Times(1)

	mockLogService.EXPECT().
		PostAuditLogWithActorString(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(nil).
		Times(1)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Params = []gin.Param{{Key: "id", Value: userID.String()}}
	c.Set("user_id", uuid.New().String())

	body, _ := json.Marshal(dto.UpdateUserAccessRequest{ClientIDs: clientIDs})
	c.Request, _ = http.NewRequest("PUT", "/admin/users/"+userID.String()+"/managed-clients",
		bytes.NewBuffer(body))
	c.Request.Header.Set("Content-Type", "application/json")

	handler.PutAdminAccess(c)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}
}

func TestPatchUserDetailsHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockService := mocks.NewMockUserService(ctrl)
	mockLogService := mocks.NewMockLogService(ctrl)
	mockClientService := mocks.NewMockClientService(ctrl)
	mockAccessService := mocks.NewMockClientAllowedUserService(ctrl)
	mockMFAService := mocks.NewMockMFAService(ctrl)

	handler := &v1.UserHandler{
		Service:       mockService,
		LogService:    mockLogService,
		ClientService: mockClientService,
		AccessService: mockAccessService,
		MFAService:    mockMFAService,
	}

	userID := uuid.New()
	actorID := uuid.New()
	accountTypeID := 2
	roleID := 1
	mfaCode := "123456"

	// Mock MFA validation
	mockMFAService.EXPECT().
		VerifyCode(gomock.Any(), actorID[:], mfaCode).
		Return(true, nil).
		Times(1)

	// Mock UserService update
	mockService.EXPECT().
		UpdateUserAccountAndRole(
			gomock.Any(),
			userID,
			gomock.Any(),
			gomock.Any(),
		).
		Return(nil).
		Times(1)

	mockLogService.EXPECT().
		GetUserEmail(gomock.Any(), gomock.Any()).
		Return("admin@example.com", nil).
		AnyTimes()

	mockLogService.EXPECT().
		PostAuditLogWithActorString(
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
		).
		Return(nil).
		AnyTimes()

	mockLogService.EXPECT().
		PostSecurityLog(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(nil).
		AnyTimes()

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Params = []gin.Param{{Key: "id", Value: userID.String()}}
	c.Set("user_id", actorID.String())
	c.Set("permissions", []string{"Edit user"})

	reqBody := dto.UpdateUserDetailsRequest{
		AccountTypeID: &accountTypeID,
		RoleID:        &roleID,
		MFACode:       mfaCode,
	}
	bodyBytes, _ := json.Marshal(reqBody)
	c.Request, _ = http.NewRequest(
		"PATCH",
		"/admin/users/"+userID.String(),
		bytes.NewBuffer(bodyBytes),
	)
	c.Request.Header.Set("Content-Type", "application/json")

	handler.PatchUserDetails(c)

	if w.Code != http.StatusOK {
		t.Errorf(
			"expected status 200, got %d. Body: %s",
			w.Code,
			w.Body.String(),
		)
	}
}

func TestGetUserList_Sorting(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("sort by ID is forbidden", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockService := mocks.NewMockUserService(ctrl)
		handler := &v1.UserHandler{Service: mockService}

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest(
			"GET",
			"/users?sort_by=id",
			nil,
		)
		c.Set("user_id", uuid.New().String())
		c.Set("permissions", []string{"View all users"})

		handler.GetUserList(c)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d", w.Code)
		}
	})

	t.Run("sort by invalid column is forbidden", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockService := mocks.NewMockUserService(ctrl)
		handler := &v1.UserHandler{Service: mockService}

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest(
			"GET",
			"/users?sort_by=invalid_col",
			nil,
		)
		c.Set("user_id", uuid.New().String())
		c.Set("permissions", []string{"View all users"})

		handler.GetUserList(c)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d", w.Code)
		}
	})

	t.Run("invalid order parameter is forbidden", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockService := mocks.NewMockUserService(ctrl)
		handler := &v1.UserHandler{Service: mockService}

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest(
			"GET",
			"/users?sort_by=email&order=invalid_order",
			nil,
		)
		c.Set("user_id", uuid.New().String())
		c.Set("permissions", []string{"View all users"})

		handler.GetUserList(c)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d", w.Code)
		}
	})
}

func TestDeleteUserHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("soft delete user successfully", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockService := mocks.NewMockUserService(ctrl)
		mockLogService := mocks.NewMockLogService(ctrl)
		handler := &v1.UserHandler{
			Service:    mockService,
			LogService: mockLogService,
		}

		userID := uuid.New()
		actorID := uuid.New()

		mockLogService.EXPECT().
			GetUserEmail(gomock.Any(), actorID[:]).
			Return("admin@example.com", nil).
			Times(1)

		mockService.EXPECT().
			DeleteUser(gomock.Any(), userID).
			Return(nil).
			Times(1)

		mockLogService.EXPECT().
			PostAuditLogWithActorString(
				gomock.Any(),
				"admin@example.com",
				gomock.Any(),
			).
			Return(nil).
			Times(1)

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		c.Params = []gin.Param{{Key: "id", Value: userID.String()}}
		c.Set("user_id", actorID.String())
		c.Set("permissions", []string{"Delete user"})

		c.Request, _ = http.NewRequest(
			"DELETE",
			"/admin/users/"+userID.String(),
			nil,
		)

		handler.DeleteUser(c)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}

		var resp dto.SuccessResponse
		if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
			t.Errorf("failed to unmarshal: %v", err)
		}
		if resp.Message != "User deleted successfully" {
			t.Errorf("expected msg 'User deleted successfully', got %s",
				resp.Message)
		}
	})

	t.Run("hard delete user successfully", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockService := mocks.NewMockUserService(ctrl)
		mockLogService := mocks.NewMockLogService(ctrl)
		handler := &v1.UserHandler{
			Service:    mockService,
			LogService: mockLogService,
		}

		userID := uuid.New()
		actorID := uuid.New()

		mockLogService.EXPECT().
			GetUserEmail(gomock.Any(), actorID[:]).
			Return("admin@example.com", nil).
			Times(1)

		mockService.EXPECT().
			HardDeleteUser(gomock.Any(), userID).
			Return(nil).
			Times(1)

		mockLogService.EXPECT().
			PostAuditLogWithActorString(
				gomock.Any(),
				"admin@example.com",
				gomock.Any(),
			).
			Return(nil).
			Times(1)

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		c.Params = []gin.Param{{Key: "id", Value: userID.String()}}
		c.Set("user_id", actorID.String())
		c.Set("permissions", []string{"Delete user"})

		c.Request, _ = http.NewRequest(
			"DELETE",
			"/admin/users/"+userID.String()+"?purge=true",
			nil,
		)

		handler.DeleteUser(c)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}

		var resp dto.SuccessResponse
		if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
			t.Errorf("failed to unmarshal: %v", err)
		}
		if resp.Message != "User permanently deleted" {
			t.Errorf(
				"expected msg 'User permanently deleted', got %s",
				resp.Message,
			)
		}
	})
}

func TestPostRestoreUserHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockService := mocks.NewMockUserService(ctrl)
	mockLogService := mocks.NewMockLogService(ctrl)
	handler := &v1.UserHandler{
		Service:    mockService,
		LogService: mockLogService,
	}

	userID := uuid.New()
	actorID := uuid.New()

	mockLogService.EXPECT().
		GetUserEmail(gomock.Any(), actorID[:]).
		Return("admin@example.com", nil).
		Times(1)

	mockService.EXPECT().
		UnarchiveUser(gomock.Any(), userID).
		Return(nil).
		Times(1)

	mockLogService.EXPECT().
		PostAuditLogWithActorString(
			gomock.Any(),
			"admin@example.com",
			gomock.Any(),
		).
		Return(nil).
		Times(1)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Params = []gin.Param{{Key: "id", Value: userID.String()}}
	c.Set("user_id", actorID.String())
	c.Set("permissions", []string{"Delete user"})

	c.Request, _ = http.NewRequest(
		"POST",
		"/admin/users/"+userID.String()+"/restore",
		nil,
	)

	handler.PostRestoreUser(c)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}

	var resp dto.SuccessResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Errorf("failed to unmarshal: %v", err)
	}
	if resp.Message != "User restored successfully" {
		t.Errorf(
			"expected msg 'User restored successfully', got %s",
			resp.Message,
		)
	}
}


