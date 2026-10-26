package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/errors"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

type stubGeoIPService struct {
	loc *service.LocationInfo
}

func (s *stubGeoIPService) ResolveIP(
	ip, cfCountry string,
) (*service.LocationInfo, error) {
	return s.loc, nil
}

func (s *stubGeoIPService) Close() error {
	return nil
}

type memoryCache struct {
	mu   sync.Mutex
	data map[string]string
}

func newMemoryCache() *memoryCache {
	return &memoryCache{data: make(map[string]string)}
}

func (m *memoryCache) Set(
	ctx context.Context,
	key, val string,
	ttl time.Duration,
) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.data[key] = val
	return nil
}

func (m *memoryCache) Get(
	ctx context.Context,
	key string,
) (string, bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	val, ok := m.data[key]
	return val, ok, nil
}

func (m *memoryCache) Delete(ctx context.Context, key string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.data, key)
	return nil
}

func (m *memoryCache) Incr(ctx context.Context, key string) (int64, error) {
	return 1, nil
}

func TestLoginAndAuthorize_ForeignLoginRequiresCaptcha(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockClientService := mocks.NewMockClientService(ctrl)
	mockLogService := mocks.NewMockLogService(ctrl)

	clientID := uuid.New()
	mockClientService.EXPECT().
		GetClientByID(gomock.Any(), clientID, gomock.Any(), gomock.Any()).
		Return(&dto.ClientResponse{Grants: []string{"authorization_code"}}, nil)

	mockLogService.EXPECT().
		ResolveClientName(gomock.Any(), clientID.String()).
		Return("Test App Client")

	// IP resolves to US (foreign)
	geoStub := &stubGeoIPService{
		loc: &service.LocationInfo{
			CountryCode: "US",
			CountryName: "United States",
			City:        "Los Angeles",
			Latitude:    34.0522,
			Longitude:   -118.2437,
			IsPrivate:   false,
		},
	}

	h := &v1.AuthHandler{
		ClientService: mockClientService,
		LogService:    mockLogService,
		GeoIPService:  geoStub,
	}

	r := gin.New()
	r.POST("/auth/login", h.LoginAndAuthorize)

	loginReq := dto.LoginRequest{
		Email:    "student@school.edu",
		Password: "Password123!",
		ClientID: clientID.String(),
	}
	body, _ := json.Marshal(loginReq)

	req := httptest.NewRequest(
		http.MethodPost,
		"/auth/login",
		bytes.NewBuffer(body),
	)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for foreign login without captcha, got %d", w.Code)
	}

	var resp dto.ErrorResponse
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	if !resp.RequiresCaptcha {
		t.Fatalf("expected requires_captcha = true for foreign login")
	}
	if resp.Code != errors.CodeCaptchaRequired {
		t.Fatalf("expected CodeCaptchaRequired, got %d", resp.Code)
	}
}

func TestLoginAndAuthorize_ImpossibleTravelTriggersSuspension(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockAuthService := mocks.NewMockAuthService(ctrl)
	mockClientService := mocks.NewMockClientService(ctrl)
	mockUserService := mocks.NewMockUserService(ctrl)
	mockLogService := mocks.NewMockLogService(ctrl)
	mockMailService := mocks.NewMockMailService(ctrl)

	clientID := uuid.New()
	userUUID := uuid.New()
	email := "student@school.edu"

	mockClientService.EXPECT().
		GetClientByID(gomock.Any(), clientID, gomock.Any(), gomock.Any()).
		Return(&dto.ClientResponse{Grants: []string{"authorization_code"}}, nil)

	mockLogService.EXPECT().
		ResolveClientName(gomock.Any(), clientID.String()).
		Return("Test App Client")

	// Credentials valid
	mockAuthService.EXPECT().
		LoginAndAuthorize(
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
		).
		Return("http://redirect", "session-123", false, nil)

	mockUserService.EXPECT().
		GetUserByEmail(gomock.Any(), email).
		Return(&dto.UserResponse{ID: userUUID.String(), Email: email}, nil)

	// Expectations for suspension upon impossible travel
	mockUserService.EXPECT().
		UpdateUserStatus(gomock.Any(), userUUID, "suspended").
		Return(nil).
		Times(1)

	mockAuthService.EXPECT().
		RevokeAllUserTokens(gomock.Any(), userUUID).
		Return(nil).
		Times(1)

	mockLogService.EXPECT().
		PostSecurityLogWithActorString(gomock.Any(), email, gomock.Any()).
		Return(nil).
		Times(1)

	mockMailService.EXPECT().
		SendSecurityAlert(
			gomock.Any(),
			email,
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
		).
		Return(nil).
		AnyTimes()

	// Setup memory cache with previous login in Manila 10 minutes ago
	memCache := newMemoryCache()
	prevGeo := map[string]interface{}{
		"lat":     14.5995,
		"lon":     120.9842,
		"city":    "Manila",
		"country": "PH",
		"ip":      "120.28.0.1",
		"ts":      time.Now().Add(-10 * time.Minute).Unix(),
	}
	prevGeoBytes, _ := json.Marshal(prevGeo)
	_ = memCache.Set(
		context.Background(),
		"geo:last_login:"+userUUID.String(),
		string(prevGeoBytes),
		time.Hour,
	)

	// Current login is in Los Angeles (> 10,000 km away)
	geoStub := &stubGeoIPService{
		loc: &service.LocationInfo{
			CountryCode: "US",
			CountryName: "United States",
			City:        "Los Angeles",
			Latitude:    34.0522,
			Longitude:   -118.2437,
			IsPrivate:   false,
		},
	}

	h := &v1.AuthHandler{
		AuthService:   mockAuthService,
		ClientService: mockClientService,
		UserService:   mockUserService,
		LogService:    mockLogService,
		MailService:   mockMailService,
		GeoIPService:  geoStub,
		Cache:         memCache,
	}

	r := gin.New()
	r.POST("/auth/login", h.LoginAndAuthorize)

	loginReq := dto.LoginRequest{
		Email:          email,
		Password:       "Password123!",
		ClientID:       clientID.String(),
		TurnstileToken: "valid-token",
	}
	body, _ := json.Marshal(loginReq)

	req := httptest.NewRequest(
		http.MethodPost,
		"/auth/login",
		bytes.NewBuffer(body),
	)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Fatalf("expected 403 Forbidden for impossible travel, got %d", w.Code)
	}

	var resp dto.ErrorResponse
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	if resp.Code != errors.CodeSuspended {
		t.Fatalf("expected CodeSuspended (1030), got %d", resp.Code)
	}
}
