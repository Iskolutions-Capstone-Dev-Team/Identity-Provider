package handler_test

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/gin-gonic/gin"
	"go.uber.org/mock/gomock"
)

/**
 * TestCheckSessionHandler verifies the GET /auth/session endpoint.
 */
func TestCheckSessionHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockAuthService := mocks.NewMockAuthService(ctrl)
	mockClientService := mocks.NewMockClientService(ctrl)
	mockLogService := mocks.NewMockLogService(ctrl)

	handler := &v1.AuthHandler{
		AuthService:   mockAuthService,
		ClientService: mockClientService,
		LogService:    mockLogService,
	}

	sessionID := "valid-session"
	userID := []byte("user-uuid-1234")
	session := &models.IdPSession{
		SessionId: sessionID,
		UserId:    userID,
	}

	// 1. Setup mock expectations
	mockAuthService.EXPECT().
		ValidateSession(gomock.Any(), sessionID).
		Return(session, nil)

	mockLogService.EXPECT().
		GetUserEmail(gomock.Any(), userID).
		Return("test@example.com", nil).
		AnyTimes()

	mockLogService.EXPECT().
		PostAuditLogWithActorString(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(nil).
		AnyTimes()

	// 2. Create context and request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Add session cookie
	c.Request, _ = http.NewRequest("GET", "/auth/session", nil)
	c.Request.AddCookie(&http.Cookie{
		Name:  service.SESSION_COOKIE_NAME,
		Value: sessionID,
	})

	// 3. Execute
	handler.CheckSession(c)

	// 4. Verify results
	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}
}

func TestAuthorize_SessionInvalidRedirectsToLogin(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockAuthService := mocks.NewMockAuthService(ctrl)
	mockClientService := mocks.NewMockClientService(ctrl)
	mockLogService := mocks.NewMockLogService(ctrl)

	handler := &v1.AuthHandler{
		AuthService:   mockAuthService,
		ClientService: mockClientService,
		LogService:    mockLogService,
	}

	clientID := "test-client-id"
	redirectURI := "http://example.com/callback"
	sessionToken := "invalid-session"

	// 1. Setup mock expectations
	mockLogService.EXPECT().
		ResolveClientName(gomock.Any(), clientID).
		Return("test-client").
		AnyTimes()

	mockAuthService.EXPECT().
		Authorize(gomock.Any(), clientID, sessionToken).
		Return("", fmt.Errorf("expired session"))

	mockLogService.EXPECT().
		PostAuditLogWithActorString(
			gomock.Any(),
			sessionToken,
			gomock.Any(),
		).
		Return(nil).
		AnyTimes()

	mockAuthService.EXPECT().
		RevokeCookies(gomock.Any())

	// 2. Create context and request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	reqURL := "/auth/authorize?client_id=" + clientID +
		"&redirect_uri=" + url.QueryEscape(redirectURI)
	c.Request, _ = http.NewRequest("GET", reqURL, nil)
	c.Request.AddCookie(&http.Cookie{
		Name:  service.SESSION_COOKIE_NAME,
		Value: sessionToken,
	})

	// 3. Execute
	handler.Authorize(c)

	// 4. Verify results
	if w.Code != http.StatusFound {
		t.Errorf("expected status 302, got %d", w.Code)
	}

	location := w.Header().Get("Location")
	expectedLocation := "/login?client_id=" + clientID +
		"&redirect_uri=" + url.QueryEscape(redirectURI)
	if !strings.Contains(location, expectedLocation) {
		t.Errorf(
			"expected redirect to contain %q, got %q",
			expectedLocation,
			location,
		)
	}
}
