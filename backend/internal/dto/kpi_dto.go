package dto

import (
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
)

// APMKPIDTO holds performance and resource utilization metrics.
type APMKPIDTO struct {
	AvgLatencyMs       float64 `json:"avg_latency_ms"`
	TxProcessingTimeMs float64 `json:"tx_processing_time_ms"`
	ThroughputRPS      float64 `json:"throughput_rps"`
	ActiveSessions     int64   `json:"active_sessions"`
	CPULoadPercent     float64 `json:"cpu_load_percent"`
	MemoryUsageMB      float64 `json:"memory_usage_mb"`
}

// SecurityKPIDTO holds authentication security performance metrics.
type SecurityKPIDTO struct {
	TotalLogins        int64   `json:"total_logins"`
	SuccessfulLogins   int64   `json:"successful_logins"`
	FailedLogins       int64   `json:"failed_logins"`
	SuccessRatePercent float64 `json:"success_rate_percent"`
	ThreatLevel        string  `json:"threat_level"`
}

// IdentityKPIDTO holds user population and account state metrics.
type IdentityKPIDTO struct {
	TotalAccounts    int64 `json:"total_accounts"`
	ActiveAccounts   int64 `json:"active_accounts"`
	ArchivedAccounts int64 `json:"archived_accounts"`
}

// SystemKPISummaryDTO represents the complete operational KPI snapshot.
type SystemKPISummaryDTO struct {
	SystemHealth string         `json:"system_health"`
	CacheStatus  string         `json:"cache_status"`
	APM          APMKPIDTO      `json:"apm"`
	Security     SecurityKPIDTO `json:"security"`
	Identity     IdentityKPIDTO `json:"identity"`
}

// ThreatTriggersDTO details threshold evaluation conditions.
type ThreatTriggersDTO struct {
	FailedLogins    int64  `json:"failed_logins"`
	HighThreshold   int64  `json:"high_threshold"`
	MediumThreshold int64  `json:"medium_threshold"`
	TriggerReason   string `json:"trigger_reason"`
}

// TargetedClientMetricDTO aggregates authentication failures per app client.
type TargetedClientMetricDTO struct {
	ClientID     string    `json:"client_id"`
	ClientName   string    `json:"client_name"`
	FailedCount  int64     `json:"failed_count"`
	SuccessCount int64     `json:"success_count"`
	LastTargeted time.Time `json:"last_targeted"`
}

// OffendingSourceDTO represents an IP and actor causing failures.
type OffendingSourceDTO struct {
	IP          string    `json:"ip"`
	Actor       string    `json:"actor"`
	FailCount   int       `json:"fail_count"`
	LastAttempt time.Time `json:"last_attempt"`
	IsMasked    bool      `json:"is_masked"`
}

// KPIThreatDetailsDTO holds the complete threat posture drilldown payload.
type KPIThreatDetailsDTO struct {
	ThreatLevel      string                         `json:"threat_level"`
	EvalTimeframe    string                         `json:"eval_timeframe"`
	Triggers         ThreatTriggersDTO              `json:"triggers"`
	AIAnalysis       *models.SecurityAnalysisResult `json:"ai_analysis,omitempty"`
	TargetedClients  []TargetedClientMetricDTO      `json:"targeted_clients"`
	OffendingSources []OffendingSourceDTO           `json:"offending_sources"`
}
