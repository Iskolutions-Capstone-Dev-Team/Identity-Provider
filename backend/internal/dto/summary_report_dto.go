package dto

import "time"

// SummaryReportParams represents query parameters for summary reports.
type SummaryReportParams struct {
	TimeFrame string `form:"time_frame,default=24h"` // 24h, 7d, 30d
	Format    string `form:"format,default=json"`    // json, pdf
}

// AccountSystemOverviewDTO contains non-PII aggregated
// account & system metrics.
type AccountSystemOverviewDTO struct {
	TotalAccounts       int64 `json:"total_accounts"`
	ActiveAccounts      int64 `json:"active_accounts"`
	ArchivedAccounts    int64 `json:"archived_accounts"`
	TotalClients        int64 `json:"total_clients"`
	ActiveClients       int64 `json:"active_clients"`
	TotalRoles          int64 `json:"total_roles"`
	TotalPermissions    int64 `json:"total_permissions"`
	AssignedPermissions int64 `json:"assigned_permissions"`
}

// AuthSecurityAnalyticsDTO contains non-PII login & security metrics.
type AuthSecurityAnalyticsDTO struct {
	TotalLogins        int64            `json:"total_logins"`
	SuccessfulLogins   int64            `json:"successful_logins"`
	FailedLogins       int64            `json:"failed_logins"`
	SuccessRatePercent float64          `json:"success_rate_percent"`
	FailureReasons     map[string]int64 `json:"failure_reasons"`
	MFAAdoptionCount   int64            `json:"mfa_adoption_count"`
	TotalDevices       int64            `json:"total_devices"`
}

// ClientUsageMetric represents usage volume per public client application.
type ClientUsageMetric struct {
	ClientName string `json:"client_name"`
	LoginCount int64  `json:"login_count"`
}

// UsageTrafficTelemetryDTO contains anonymized traffic statistics.
type UsageTrafficTelemetryDTO struct {
	TopClientsUsage []ClientUsageMetric `json:"top_clients_usage"`
	BrowserStats    map[string]int64    `json:"browser_stats"`
	OSStats         map[string]int64    `json:"os_stats"`
}

// AuditMetric represents aggregated audit event counts.
type AuditMetric struct {
	Category string `json:"category"`
	Count    int64  `json:"count"`
}

// AuditPerformanceTelemetryDTO contains audit log counts and APM health.
type AuditPerformanceTelemetryDTO struct {
	AuditLogMetrics    []AuditMetric `json:"audit_log_metrics"`
	SystemHealth       string        `json:"system_health"`
	CacheStatus        string        `json:"cache_status"`
	AvgLatencyMs       float64       `json:"avg_latency_ms"`
	TxProcessingTimeMs float64       `json:"tx_processing_time_ms"`
	ThroughputRPS      float64       `json:"throughput_rps"`
	ActiveSessions     int64         `json:"active_sessions"`
	CPULoadPercent     float64       `json:"cpu_load_percent"`
	MemoryUsageMB      float64       `json:"memory_usage_mb"`
}

// SummaryReportResponse represents the root structure for
// non-PII summary reports.
type SummaryReportResponse struct {
	Title       string                       `json:"title"`
	GeneratedAt time.Time                    `json:"generated_at"`
	TimeFrame   string                       `json:"time_frame"`
	Overview    AccountSystemOverviewDTO     `json:"overview"`
	Security    AuthSecurityAnalyticsDTO     `json:"security"`
	Traffic     UsageTrafficTelemetryDTO     `json:"traffic"`
	Performance AuditPerformanceTelemetryDTO `json:"performance"`
}
