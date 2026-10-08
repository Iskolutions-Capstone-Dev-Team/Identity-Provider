package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
)

func TestGetSystemKPIs(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	mockMetricsRepo := mocks.NewMockMetricsRepository(ctrl)

	mockMetricsRepo.EXPECT().
		GetUserMetrics(gomock.Any(), gomock.Nil()).
		Return([]models.MetricCard{
			{Title: "Total Users", Value: "100"},
			{Title: "Active Users", Value: "85"},
			{Title: "Suspended Users", Value: "15"},
		}, nil)

	mockMetricsRepo.EXPECT().
		GetTotalLogins(gomock.Any(), gomock.Any(), gomock.Nil()).
		Return(150, nil)

	mockMetricsRepo.EXPECT().
		GetFailedAuthAttempts(gomock.Any(), gomock.Any(), gomock.Nil()).
		Return([]models.FailedAuthAttempt{
			{FailCount: 5, LastAttempt: time.Now()},
		}, nil)

	kpiSvc := service.NewKPIService(
		mockUserRepo,
		mockMetricsRepo,
		nil,
		nil,
	)

	kpiRes, err := kpiSvc.GetSystemKPIs(context.Background())
	assert.NoError(t, err)
	assert.NotNil(t, kpiRes)
	assert.Equal(t, int64(100), kpiRes.Identity.TotalAccounts)
	assert.Equal(t, int64(85), kpiRes.Identity.ActiveAccounts)
	assert.Equal(t, int64(15), kpiRes.Identity.ArchivedAccounts)
	assert.Equal(t, int64(150), kpiRes.Security.TotalLogins)
	assert.Equal(t, int64(5), kpiRes.Security.FailedLogins)
	assert.Equal(t, "LOW", kpiRes.Security.ThreatLevel)
}
