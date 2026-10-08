package dto

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
