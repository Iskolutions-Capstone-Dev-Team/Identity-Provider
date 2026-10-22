package handler_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	v1 "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

func TestDeviceHandler_ListDevices(t *testing.T) {
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockSvc := mocks.NewMockDeviceService(ctrl)
	h := &v1.DeviceHandler{Service: mockSvc}

	testUserID := uuid.New()

	mockSvc.EXPECT().ListDevices(gomock.Any(), testUserID).Return(
		[]dto.UserDeviceResponse{
			{
				ID:        uuid.New().String(),
				Name:      "Chrome on Windows",
				IPAddress: "127.0.0.1",
				UserAgent: "Mozilla/5.0",
				CreatedAt: time.Now(),
				ExpiresAt: time.Now().Add(24 * time.Hour),
			},
		},
		nil,
	)

	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set("user_id", testUserID.String())
		c.Next()
	})
	r.GET("/api/v1/devices", h.ListDevices)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/devices", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
}

func TestDeviceHandler_ListDevices_Empty(t *testing.T) {
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockSvc := mocks.NewMockDeviceService(ctrl)
	h := &v1.DeviceHandler{Service: mockSvc}

	testUserID := uuid.New()

	mockSvc.EXPECT().ListDevices(gomock.Any(), testUserID).Return(
		[]dto.UserDeviceResponse{}, nil,
	)

	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set("user_id", testUserID.String())
		c.Next()
	})
	r.GET("/api/v1/devices", h.ListDevices)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/devices", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	if w.Body.String() != "[]" {
		t.Fatalf("expected [], got %s", w.Body.String())
	}
}

func TestDeviceHandler_UpdateDevice(t *testing.T) {
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockSvc := mocks.NewMockDeviceService(ctrl)
	h := &v1.DeviceHandler{Service: mockSvc}

	testUserID := uuid.New()
	testDeviceID := uuid.New()

	mockSvc.EXPECT().UpdateDeviceName(
		gomock.Any(), testDeviceID, testUserID, "Updated Name",
	).Return(nil)

	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set("user_id", testUserID.String())
		c.Next()
	})
	r.PATCH("/api/v1/devices/:id", h.UpdateDevice)

	body := strings.NewReader(`{"name":"Updated Name"}`)
	req := httptest.NewRequest(
		http.MethodPatch,
		"/api/v1/devices/"+testDeviceID.String(),
		body,
	)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
}

func TestDeviceHandler_DeleteDevice(t *testing.T) {
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockSvc := mocks.NewMockDeviceService(ctrl)
	h := &v1.DeviceHandler{Service: mockSvc}

	testUserID := uuid.New()
	testDeviceID := uuid.New()

	mockSvc.EXPECT().DeleteDevice(
		gomock.Any(), testDeviceID, testUserID,
	).Return(nil)

	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set("user_id", testUserID.String())
		c.Next()
	})
	r.DELETE("/api/v1/devices/:id", h.DeleteDevice)

	req := httptest.NewRequest(
		http.MethodDelete,
		"/api/v1/devices/"+testDeviceID.String(),
		nil,
	)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
}
