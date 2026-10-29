package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"slices"
	"strings"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/cache"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	repo "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/telemetry"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// KPIService handles aggregation of system Key Performance Indicators.
type KPIService interface {
	GetSystemKPIs(
		ctx context.Context,
		permissions []string,
		userID uuid.UUID,
	) (*dto.SystemKPISummaryDTO, error)
	GetKPIThreatDetails(
		ctx context.Context,
		permissions []string,
		userID uuid.UUID,
	) (*dto.KPIThreatDetailsDTO, error)
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
	permissions []string,
	userID uuid.UUID,
) (*dto.SystemKPISummaryDTO, error) {
	apmTelemetry := telemetry.GlobalCollector.GetTelemetry(
		ctx, s.db, s.cache,
	)

	hasAllUsers := slices.Contains(permissions, "View all users")
	hasClientUsers := slices.Contains(
		permissions, "View users based on appclient",
	)

	var userMetrics []models.MetricCard
	if hasAllUsers || hasClientUsers {
		var adminID []byte
		if !hasAllUsers {
			adminID = userID[:]
		}
		var err error
		userMetrics, err = s.metricsRepo.GetUserMetrics(ctx, adminID)
		if err != nil {
			log.Printf("[KPIService] GetUserMetrics: %v", err)
			return nil, fmt.Errorf("failed to fetch user metrics: %w", err)
		}
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

// GetKPIThreatDetails aggregates threat posture triggers, targeted clients,
// offending sources with privacy masking, and AI security insights.
func (s *kpiService) GetKPIThreatDetails(
	ctx context.Context,
	permissions []string,
	userID uuid.UUID,
) (*dto.KPIThreatDetailsDTO, error) {
	since := time.Now().Add(-24 * time.Hour)

	var allowedClients []string
	if !slices.Contains(permissions, "View all appclients") &&
		!slices.Contains(permissions, "View audit logs") &&
		s.metricsRepo != nil {
		var err error
		allowedClients, err = s.metricsRepo.GetBoundClientIDs(ctx, userID[:])
		if err != nil {
			log.Printf("[KPIService] GetBoundClientIDs: %v", err)
			return nil, fmt.Errorf("failed to fetch bound client IDs: %w", err)
		}
		if allowedClients == nil {
			allowedClients = []string{}
		}
	}

	failedAttempts, err := s.metricsRepo.GetFailedAuthAttempts(
		ctx, since, allowedClients,
	)
	if err != nil {
		log.Printf("[KPIService] GetFailedAuthAttempts: %v", err)
		return nil, fmt.Errorf("failed to fetch failed attempts: %w", err)
	}

	var failCount int64
	for _, a := range failedAttempts {
		failCount += int64(a.FailCount)
	}

	threatLevel := "LOW"
	triggerReason := fmt.Sprintf(
		"Authentication activity within normal baseline (%d failures <= 15).",
		failCount,
	)
	if failCount > 50 {
		threatLevel = "HIGH"
		triggerReason = fmt.Sprintf(
			"Failed login count (%d) exceeded high threshold (50) in past 24h.",
			failCount,
		)
	} else if failCount > 15 {
		threatLevel = "MEDIUM"
		triggerReason = fmt.Sprintf(
			"Failed login count (%d) exceeded elevated threshold (15) past 24h.",
			failCount,
		)
	}

	targetedFailures, err := s.metricsRepo.GetTargetedClientFailures(
		ctx, 10, since, allowedClients,
	)
	if err != nil {
		log.Printf("[KPIService] GetTargetedClientFailures: %v", err)
		return nil, fmt.Errorf("failed to fetch targeted clients: %w", err)
	}

	targetedClients := make(
		[]dto.TargetedClientMetricDTO, 0, len(targetedFailures),
	)
	for _, tf := range targetedFailures {
		targetedClients = append(targetedClients, dto.TargetedClientMetricDTO{
			ClientID:     tf.ClientID,
			ClientName:   tf.ClientName,
			FailedCount:  tf.FailedCount,
			SuccessCount: tf.SuccessCount,
			LastTargeted: tf.LastTargeted,
		})
	}

	hasAuditLogsPerm := slices.Contains(permissions, "View audit logs")
	offendingSources := make([]dto.OffendingSourceDTO, 0, len(failedAttempts))
	for _, fa := range failedAttempts {
		ip := fa.IP
		actor := fa.Actor
		isMasked := false
		if !hasAuditLogsPerm {
			ip = maskIP(ip)
			actor = maskActor(actor)
			isMasked = true
		}
		offendingSources = append(offendingSources, dto.OffendingSourceDTO{
			IP:          ip,
			Actor:       actor,
			FailCount:   fa.FailCount,
			LastAttempt: fa.LastAttempt,
			IsMasked:    isMasked,
		})
	}

	var aiAnalysis *models.SecurityAnalysisResult
	if s.cache != nil {
		cachedVal, ok, err := s.cache.Get(ctx, "metrics:security_analysis")
		if err == nil && ok && cachedVal != "" {
			var analysis models.SecurityAnalysisResult
			if err := json.Unmarshal([]byte(cachedVal), &analysis); err == nil {
				aiAnalysis = &analysis
			}
		}
	}

	return &dto.KPIThreatDetailsDTO{
		ThreatLevel:   threatLevel,
		EvalTimeframe: "Past 24 Hours",
		Triggers: dto.ThreatTriggersDTO{
			FailedLogins:    failCount,
			HighThreshold:   50,
			MediumThreshold: 15,
			TriggerReason:   triggerReason,
		},
		AIAnalysis:       aiAnalysis,
		TargetedClients:  targetedClients,
		OffendingSources: offendingSources,
	}, nil
}

func maskIP(ip string) string {
	if ip == "" {
		return ""
	}
	parts := strings.Split(ip, ".")
	if len(parts) == 4 {
		return fmt.Sprintf("%s.%s.%s.***", parts[0], parts[1], parts[2])
	}
	if len(ip) > 4 {
		return ip[:len(ip)/2] + "***"
	}
	return "***"
}

func maskActor(actor string) string {
	if actor == "" {
		return ""
	}
	if strings.Contains(actor, "@") {
		parts := strings.Split(actor, "@")
		name := parts[0]
		domain := parts[1]
		if len(name) > 1 {
			return string(name[0]) + "***@" + domain
		}
		return "*@" + domain
	}
	if len(actor) > 1 {
		return string(actor[0]) + "***"
	}
	return "***"
}

