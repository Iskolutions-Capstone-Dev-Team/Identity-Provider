package models

import "time"

// TopClientLogin represents client name and its successful login count.
type TopClientLogin struct {
	ClientID   string `db:"client_id" json:"client_id"`
	ClientName string `db:"client_name" json:"client_name"`
	LoginCount int    `db:"login_count" json:"login_count"`
}

// LoginStats holds total login counts for different periods.
type LoginStats struct {
	Today     int `json:"today"`
	ThisWeek  int `json:"this_week"`
	ThisMonth int `json:"this_month"`
}

// SecurityAnalysisResult represents the structured output of Gemini analysis.
type SecurityAnalysisResult struct {
	ThreatLevel string    `json:"threat_level"` // LOW, MEDIUM, HIGH
	Confidence  float64   `json:"confidence"`
	Anomalies   []string  `json:"anomalies"`
	Advisory    string    `json:"advisory"`
	AnalyzedAt  time.Time `json:"analyzed_at"`
}

// DashboardMetrics holds the combined non-AI and AI metrics.
type DashboardMetrics struct {
	LoginStats       LoginStats             `json:"login_stats"`
	TopClients       []TopClientLogin       `json:"top_clients"`
	SecurityAnalysis SecurityAnalysisResult `json:"security_analysis"`
}

// FailedAuthAttempt aggregates details of a failed login attempt.
type FailedAuthAttempt struct {
	IP          string    `db:"ip" json:"ip"`
	Actor       string    `db:"actor" json:"actor"`
	FailCount   int       `db:"fail_count" json:"fail_count"`
	LastAttempt time.Time `db:"last_attempt" json:"last_attempt"`
}
