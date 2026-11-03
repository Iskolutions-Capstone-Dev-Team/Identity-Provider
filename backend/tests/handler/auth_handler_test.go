package handler_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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

/**
 * TestPostTokenExchange_InvalidClientID verifies client ID UUID validation.
 */
func TestPostTokenExchange_InvalidClientID(t *testing.T) {
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

	body := []byte(`{"client_id":"' OR '1'='1","client_secret":"sec","code":"c"}`)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("POST", "/auth/token", bytes.NewReader(body))
	c.Request.Header.Set("Content-Type", "application/json")

	handler.PostTokenExchange(c)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", w.Code)
	}

	var errResp dto.ErrorResponse
	_ = json.Unmarshal(w.Body.Bytes(), &errResp)
	if strings.Contains(errResp.Error, "sql") {
		t.Errorf(
			"error response should not leak sql keywords: %s",
			errResp.Error,
		)
	}
}

/**
 * TestPostTokenExchange_SQLInjectionCode verifies code format validation.
 */
func TestPostTokenExchange_SQLInjectionCode(t *testing.T) {
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

	cUUID := uuid.New()
	body := []byte(fmt.Sprintf(
		`{"client_id":"%s","client_secret":"sec","code":"' OR 1=1 --"}`,
		cUUID.String(),
	))
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("POST", "/auth/token", bytes.NewReader(body))
	c.Request.Header.Set("Content-Type", "application/json")

	handler.PostTokenExchange(c)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", w.Code)
	}
}

/**
 * TestPostTokenExchange_CodeNotFoundReturns400 verifies 400 on invalid code.
 */
func TestPostTokenExchange_CodeNotFoundReturns400(t *testing.T) {
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

	cUUID := uuid.New()
	validCode := "abcdefghijklmnopqrstuvwxyz0123456789-_ABCDE"
	clientResp := &dto.ClientResponse{
		ID:     cUUID.String(),
		Grants: []string{"authorization_code"},
	}

	mockClientService.EXPECT().
		GetClientByID(gomock.Any(), cUUID, gomock.Any(), gomock.Any()).
		Return(clientResp, nil)

	mockLogService.EXPECT().
		ResolveClientName(gomock.Any(), cUUID.String()).
		Return("test-client")

	mockAuthService.EXPECT().
		ExchangeCodeForToken(gomock.Any(), gomock.Any()).
		Return(nil, fmt.Errorf("code exchange: code not found"))

	mockLogService.EXPECT().
		PostAuditLogWithActorString(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(nil)

	mockLogService.EXPECT().
		PostSecurityLogWithActorString(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(nil)

	body := []byte(fmt.Sprintf(
		`{"client_id":"%s","client_secret":"sec","code":"%s"}`,
		cUUID.String(),
		validCode,
	))
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("POST", "/auth/token", bytes.NewReader(body))
	c.Request.Header.Set("Content-Type", "application/json")

	handler.PostTokenExchange(c)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400 for code exchange failure, got %d", w.Code)
	}

	var errResp dto.ErrorResponse
	_ = json.Unmarshal(w.Body.Bytes(), &errResp)
	if strings.Contains(errResp.Error, "sql:") {
		t.Errorf("error response leaked SQL details: %s", errResp.Error)
	}
}

/**
 * TestPostTokenExchange_DatabaseErrorMasked verifies SQL error redaction.
 */
func TestPostTokenExchange_DatabaseErrorMasked(t *testing.T) {
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

	cUUID := uuid.New()
	validCode := "abcdefghijklmnopqrstuvwxyz0123456789-_ABCDE"
	clientResp := &dto.ClientResponse{
		ID:     cUUID.String(),
		Grants: []string{"authorization_code"},
	}

	mockClientService.EXPECT().
		GetClientByID(gomock.Any(), cUUID, gomock.Any(), gomock.Any()).
		Return(clientResp, nil)

	mockLogService.EXPECT().
		ResolveClientName(gomock.Any(), cUUID.String()).
		Return("test-client")

	mockAuthService.EXPECT().
		ExchangeCodeForToken(gomock.Any(), gomock.Any()).
		Return(
			nil,
			fmt.Errorf("database query (GetClaims): sql: connection dead"),
		)

	mockLogService.EXPECT().
		PostAuditLogWithActorString(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(nil)

	mockLogService.EXPECT().
		PostSecurityLogWithActorString(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(nil)

	body := []byte(fmt.Sprintf(
		`{"client_id":"%s","client_secret":"sec","code":"%s"}`,
		cUUID.String(),
		validCode,
	))
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("POST", "/auth/token", bytes.NewReader(body))
	c.Request.Header.Set("Content-Type", "application/json")

	handler.PostTokenExchange(c)

	if w.Code != http.StatusInternalServerError {
		t.Fatalf("expected status 500 for db failure, got %d", w.Code)
	}

	var errResp dto.ErrorResponse
	_ = json.Unmarshal(w.Body.Bytes(), &errResp)
	if strings.Contains(errResp.Error, "sql:") ||
		strings.Contains(errResp.Error, "database query") {
		t.Errorf("error response leaked internal db details: %s", errResp.Error)
	}
	if errResp.Error != "An unexpected error occurred. Please try again." {
		t.Errorf("expected clean masked error, got: %s", errResp.Error)
	}
}

/**
 * TestPostTokenExchange_Success verifies valid token exchange behavior.
 */
func TestPostTokenExchange_Success(t *testing.T) {
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

	cUUID := uuid.New()
	validCode := "abcdefghijklmnopqrstuvwxyz0123456789-_ABCDE"
	clientResp := &dto.ClientResponse{
		ID:     cUUID.String(),
		Grants: []string{"authorization_code"},
	}

	mockClientService.EXPECT().
		GetClientByID(gomock.Any(), cUUID, gomock.Any(), gomock.Any()).
		Return(clientResp, nil)

	mockLogService.EXPECT().
		ResolveClientName(gomock.Any(), cUUID.String()).
		Return("test-client")

	tokenResp := &dto.TokenResponse{
		AccessToken:  "valid-jwt-token",
		RefreshToken: "valid-refresh-token",
		ExpiresIn:    3600,
		TokenType:    "Bearer",
	}

	mockAuthService.EXPECT().
		ExchangeCodeForToken(gomock.Any(), gomock.Any()).
		Return(tokenResp, nil)

	mockLogService.EXPECT().
		PostAuditLogWithActorString(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(nil)

	mockLogService.EXPECT().
		PostSecurityLogWithActorString(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(nil)

	body := []byte(fmt.Sprintf(
		`{"client_id":"%s","client_secret":"sec","code":"%s"}`,
		cUUID.String(),
		validCode,
	))
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("POST", "/auth/token", bytes.NewReader(body))
	c.Request.Header.Set("Content-Type", "application/json")

	handler.PostTokenExchange(c)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	var parsedResp dto.TokenResponse
	_ = json.Unmarshal(w.Body.Bytes(), &parsedResp)
	if parsedResp.AccessToken != "valid-jwt-token" {
		t.Errorf(
			"expected access token 'valid-jwt-token', got %s",
			parsedResp.AccessToken,
		)
	}
}
