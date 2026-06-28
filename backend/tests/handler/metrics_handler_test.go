package handler_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type mockMetricsService struct {
	service.MetricsService
}

func (m *mockMetricsService) GetClientMetrics(
	ctx context.Context,
	permissions []string,
	userID uuid.UUID,
) ([]models.MetricCard, error) {
	return []models.MetricCard{
		{
			Title: "Test Client",
			Value: "1",
		},
	}, nil
}

func (m *mockMetricsService) GetLogMetrics(
	ctx context.Context,
	permissions []string,
) ([]models.MetricCard, error) {
	var cards []models.MetricCard
	for _, p := range permissions {
		if p == "View audit logs" {
			cards = append(cards, models.MetricCard{Title: "Audit Logs"})
		}
		if p == "View security logs" {
			cards = append(cards, models.MetricCard{Title: "Security Logs"})
		}
	}
	return cards, nil
}

func TestGetClientMetrics_Unauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := &v1.MetricsHandler{
		MetricsService: &mockMetricsService{},
	}

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Set("user_id", uuid.New().String())
	c.Set("permissions", []string{"Wrong permission"})
	c.Request, _ = http.NewRequest("GET", "/admin/metrics/clients", nil)

	handler.GetClientMetrics(c)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", w.Code)
	}
}

func TestGetClientMetrics_Authorized(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := &v1.MetricsHandler{
		MetricsService: &mockMetricsService{},
	}

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Set("user_id", uuid.New().String())
	c.Set("permissions", []string{"View connected appclients"})
	c.Request, _ = http.NewRequest("GET", "/admin/metrics/clients", nil)

	handler.GetClientMetrics(c)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resp []models.MetricCard
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Errorf("failed to decode response: %v", err)
	}

	if len(resp) != 1 || resp[0].Title != "Test Client" {
		t.Errorf("unexpected response content: %v", resp)
	}
}

func TestGetLogMetrics_AuditOnly(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := &v1.MetricsHandler{
		MetricsService: &mockMetricsService{},
	}

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Set("user_id", uuid.New().String())
	c.Set("permissions", []string{"View audit logs"})
	c.Request, _ = http.NewRequest("GET", "/admin/metrics/logs", nil)

	handler.GetLogMetrics(c)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resp []models.MetricCard
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Errorf("failed to decode response: %v", err)
	}

	if len(resp) != 1 || resp[0].Title != "Audit Logs" {
		t.Errorf("unexpected response content: %v", resp)
	}
}

func TestGetLogMetrics_SecurityOnly(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := &v1.MetricsHandler{
		MetricsService: &mockMetricsService{},
	}

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Set("user_id", uuid.New().String())
	c.Set("permissions", []string{"View security logs"})
	c.Request, _ = http.NewRequest("GET", "/admin/metrics/logs", nil)

	handler.GetLogMetrics(c)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resp []models.MetricCard
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Errorf("failed to decode response: %v", err)
	}

	if len(resp) != 1 || resp[0].Title != "Security Logs" {
		t.Errorf("unexpected response content: %v", resp)
	}
}

func TestGetLogMetrics_Both(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := &v1.MetricsHandler{
		MetricsService: &mockMetricsService{},
	}

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Set("user_id", uuid.New().String())
	c.Set("permissions", []string{
		"View audit logs",
		"View security logs",
	})
	c.Request, _ = http.NewRequest("GET", "/admin/metrics/logs", nil)

	handler.GetLogMetrics(c)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resp []models.MetricCard
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Errorf("failed to decode response: %v", err)
	}

	if len(resp) != 2 ||
		resp[0].Title != "Audit Logs" ||
		resp[1].Title != "Security Logs" {
		t.Errorf("unexpected response content: %v", resp)
	}
}

func TestGetLogMetrics_Unauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := &v1.MetricsHandler{
		MetricsService: &mockMetricsService{},
	}

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Set("user_id", uuid.New().String())
	c.Set("permissions", []string{"View roles"})
	c.Request, _ = http.NewRequest("GET", "/admin/metrics/logs", nil)

	handler.GetLogMetrics(c)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", w.Code)
	}
}
