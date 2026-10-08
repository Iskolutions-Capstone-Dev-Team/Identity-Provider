package service

import (
	"context"
	"fmt"
	"log"
	"math"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/cache"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	repo "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/telemetry"
	"github.com/jmoiron/sqlx"
)

// KPIService handles aggregation of system Key Performance Indicators.
type KPIService interface {
	GetSystemKPIs(
		ctx context.Context,
	) (*dto.SystemKPISummaryDTO, error)
}

type kpiService struct {
	userRepo    repo.UserRepository
	metricsRepo repo.MetricsRepository
	cache       cache.Cache
	db          *sqlx.DB
}

// NewKPIService creates a new instance of KPIService.
func NewKPIService(
	userRepo repo.UserRepository,
	metricsRepo repo.MetricsRepository,
	c cache.Cache,
	db *sqlx.DB,
) KPIService {
	return &kpiService{
		userRepo:    userRepo,
		metricsRepo: metricsRepo,
		cache:       c,
		db:          db,
	}
}

// GetSystemKPIs calculates live APM, security, and identity lifecycle KPIs.
func (s *kpiService) GetSystemKPIs(
	ctx context.Context,
) (*dto.SystemKPISummaryDTO, error) {
	apmTelemetry := telemetry.GlobalCollector.GetTelemetry(
		ctx, s.db, s.cache,
	)

	userMetrics, err := s.metricsRepo.GetUserMetrics(ctx, nil)
	if err != nil {
		log.Printf("[KPIService] GetUserMetrics: %v", err)
		return nil, fmt.Errorf("failed to fetch user metrics: %w", err)
	}

	identity := dto.IdentityKPIDTO{}
	for _, m := range userMetrics {
		switch m.Title {
		case "Total Users":
			identity.TotalAccounts = parseMetricValue(m.Value)
		case "Active Users":
			identity.ActiveAccounts = parseMetricValue(m.Value)
		case "Suspended Users":
			identity.ArchivedAccounts = parseMetricValue(m.Value)
		}
	}

	since := time.Now().Add(-24 * time.Hour)
	totalLogins, err := s.metricsRepo.GetTotalLogins(ctx, since, nil)
	if err != nil {
		log.Printf("[KPIService] GetTotalLogins: %v", err)
		return nil, fmt.Errorf("failed to fetch login count: %w", err)
	}

	failedAttempts, err := s.metricsRepo.GetFailedAuthAttempts(
		ctx, since, nil,
	)
	if err != nil {
		log.Printf("[KPIService] GetFailedAuthAttempts: %v", err)
		return nil, fmt.Errorf("failed to fetch failed attempts: %w", err)
	}

	var failCount int64
	for _, a := range failedAttempts {
		failCount += int64(a.FailCount)
	}

	totalLogins64 := int64(totalLogins)
	successfulLogins := totalLogins64
	if totalLogins64 > failCount {
		successfulLogins = totalLogins64 - failCount
	}

	var successRate float64
	if totalLogins64 > 0 {
		rate := (float64(successfulLogins) / float64(totalLogins64)) * 100
		successRate = math.Round(rate*100) / 100
	}

	threatLevel := "LOW"
	if failCount > 50 {
		threatLevel = "HIGH"
	} else if failCount > 15 {
		threatLevel = "MEDIUM"
	}

	security := dto.SecurityKPIDTO{
		TotalLogins:        totalLogins64,
		SuccessfulLogins:   successfulLogins,
		FailedLogins:       failCount,
		SuccessRatePercent: successRate,
		ThreatLevel:        threatLevel,
	}

	apm := dto.APMKPIDTO{
		AvgLatencyMs:       apmTelemetry.AvgLatencyMs,
		TxProcessingTimeMs: apmTelemetry.TxProcessingTimeMs,
		ThroughputRPS:      apmTelemetry.ThroughputRPS,
		ActiveSessions:     apmTelemetry.ActiveSessions,
		CPULoadPercent:     apmTelemetry.CPULoadPercent,
		MemoryUsageMB:      apmTelemetry.MemoryUsageMB,
	}

	return &dto.SystemKPISummaryDTO{
		SystemHealth: apmTelemetry.SystemHealth,
		CacheStatus:  apmTelemetry.CacheStatus,
		APM:          apm,
		Security:     security,
		Identity:     identity,
	}, nil
}
