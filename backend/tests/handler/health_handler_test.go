package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/storage"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type mockHealthCache struct {
	store map[string]string
}

func (m *mockHealthCache) Set(
	ctx context.Context, key, val string, ttl time.Duration,
) error {
	m.store[key] = val
	return nil
}

func (m *mockHealthCache) Get(
	ctx context.Context, key string,
) (string, bool, error) {
	val, ok := m.store[key]
	return val, ok, nil
}

func (m *mockHealthCache) Delete(ctx context.Context, key string) error {
	delete(m.store, key)
	return nil
}

func (m *mockHealthCache) Incr(
	ctx context.Context, key string,
) (int64, error) {
	return 0, nil
}

type mockTransport struct {
	roundTripFunc func(req *http.Request) (*http.Response, error)
}

func (m *mockTransport) RoundTrip(
	req *http.Request,
) (*http.Response, error) {
	return m.roundTripFunc(req)
}

func TestHealthCheck(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	sqlDB, mock, err := sqlmock.New(sqlmock.MonitorPingsOption(true))
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer sqlDB.Close()
	db := sqlx.NewDb(sqlDB, "sqlmock")

	mock.ExpectPing()
	mock.ExpectPing()

	cacheStore := make(map[string]string)
	cacheStore["health_check_test_key"] = "ok"
	mockCache := &mockHealthCache{store: cacheStore}

	transport := &mockTransport{
		roundTripFunc: func(req *http.Request) (*http.Response, error) {
			if strings.Contains(req.URL.RawQuery, "location") {
				xmlBody := "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
					"<LocationConstraint xmlns=\"http://s3.amazonaws.com/" +
					"doc/2006-03-01/\">us-east-1</LocationConstraint>"
				return &http.Response{
					StatusCode:    http.StatusOK,
					Proto:         "HTTP/1.1",
					ProtoMajor:    1,
					ProtoMinor:    1,
					Body:          io.NopCloser(strings.NewReader(xmlBody)),
					Header:        make(http.Header),
					ContentLength: int64(len(xmlBody)),
					Request:       req,
				}, nil
			}
			return &http.Response{
				StatusCode:    http.StatusOK,
				Proto:         "HTTP/1.1",
				ProtoMajor:    1,
				ProtoMinor:    1,
				Body:          io.NopCloser(bytes.NewReader([]byte{})),
				Header:        make(http.Header),
				ContentLength: 0,
				Request:       req,
			}, nil
		},
	}
	client, _ := minio.New("localhost:9000", &minio.Options{
		Creds:     credentials.NewStaticV4("key", "secret", ""),
		Secure:    false,
		Transport: transport,
	})
	mockStore := &storage.S3Provider{
		Client:     client,
		BucketName: "my-bucket",
	}

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
		HealthHandler:       v1.NewHealthHandler(db, mockCache, mockStore),
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
				t.Errorf(
					"expected status 200, got %d. Body: %s",
					w.Code,
					w.Body.String(),
				)
			}

			var body map[string]interface{}
			if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
				t.Fatalf("failed to parse response body: %v", err)
			}

			if body["status"] != "healthy" {
				t.Errorf(
					"expected status 'healthy', got '%s'. Body: %s",
					body["status"],
					w.Body.String(),
				)
			}
		})
	}
}
