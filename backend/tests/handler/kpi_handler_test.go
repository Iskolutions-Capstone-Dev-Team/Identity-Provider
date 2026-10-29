package handler_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	v1 "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

type mockKPIService struct {
	kpiResult     *dto.SystemKPISummaryDTO
	threatDetails *dto.KPIThreatDetailsDTO
	err           error
}

func (m *mockKPIService) GetSystemKPIs(
	ctx context.Context,
	permissions []string,
	userID uuid.UUID,
) (*dto.SystemKPISummaryDTO, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.kpiResult, nil
}

func (m *mockKPIService) GetKPIThreatDetails(
	ctx context.Context,
	permissions []string,
	userID uuid.UUID,
) (*dto.KPIThreatDetailsDTO, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.threatDetails, nil
}

func TestKPIHandlerGetSystemKPIs(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockSvc := &mockKPIService{
		kpiResult: &dto.SystemKPISummaryDTO{
			SystemHealth: "Healthy",
			CacheStatus:  "Operational",
			APM: dto.APMKPIDTO{
				AvgLatencyMs: 12.5,
			},
			Security: dto.SecurityKPIDTO{
				TotalLogins: 100,
			},
			Identity: dto.IdentityKPIDTO{
				TotalAccounts: 50,
			},
		},
	}

	handler := v1.NewKPIHandler(mockSvc)

	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set("user_id", uuid.New().String())
		c.Set("permissions", []string{"View audit logs"})
		c.Next()
	})
	r.GET("/api/v1/admin/kpis", handler.GetSystemKPIs)

	req, _ := http.NewRequest("GET", "/api/v1/admin/kpis", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp dto.SystemKPISummaryDTO
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, "Healthy", resp.SystemHealth)
	assert.Equal(t, int64(100), resp.Security.TotalLogins)
}

func TestKPIHandlerGetKPIThreatDetails(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockSvc := &mockKPIService{
		threatDetails: &dto.KPIThreatDetailsDTO{
			ThreatLevel:   "HIGH",
			EvalTimeframe: "Past 24 Hours",
			Triggers: dto.ThreatTriggersDTO{
				FailedLogins:  60,
				HighThreshold: 50,
				TriggerReason: "Exceeded threshold",
			},
			TargetedClients: []dto.TargetedClientMetricDTO{
				{ClientID: "client-1", ClientName: "App 1", FailedCount: 40},
			},
			OffendingSources: []dto.OffendingSourceDTO{
				{IP: "192.168.1.1", Actor: "admin", FailCount: 30},
			},
		},
	}

	handler := v1.NewKPIHandler(mockSvc)

	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set("user_id", uuid.New().String())
		c.Set("permissions", []string{"View audit logs"})
		c.Next()
	})
	r.GET("/api/v1/admin/kpis/threat-details", handler.GetKPIThreatDetails)

	req, _ := http.NewRequest("GET", "/api/v1/admin/kpis/threat-details", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp dto.KPIThreatDetailsDTO
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, "HIGH", resp.ThreatLevel)
	assert.Equal(t, int64(60), resp.Triggers.FailedLogins)
	assert.Len(t, resp.TargetedClients, 1)
	assert.Equal(t, "App 1", resp.TargetedClients[0].ClientName)
}

