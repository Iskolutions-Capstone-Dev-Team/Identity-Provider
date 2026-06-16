package models

import "time"

// TopClientLogin represents client name, its image, and login count.
type TopClientLogin struct {
	ClientID      string `db:"client_id" json:"client_id"`
	ClientName    string `db:"client_name" json:"client_name"`
	ImageLocation string `db:"image_location" json:"-"`
	ImageURL      string `json:"image_url"`
	LoginCount    int    `db:"login_count" json:"login_count"`
}

// LoginStats holds timeframe stats for different periods.
type LoginStats struct {
	Today     TimeframeStats `json:"today"`
	ThisWeek  TimeframeStats `json:"this_week"`
	ThisMonth TimeframeStats `json:"this_month"`
}

// TimeframeStats holds login count and top client list for a timeframe.
type TimeframeStats struct {
	Count      int              `json:"count"`
	TopClients []TopClientLogin `json:"top_clients"`
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
	SecurityAnalysis SecurityAnalysisResult `json:"security_analysis"`
}

// FailedAuthAttempt aggregates details of a failed login attempt.
type FailedAuthAttempt struct {
	IP          string    `db:"ip" json:"ip"`
	Actor       string    `db:"actor" json:"actor"`
	FailCount   int       `db:"fail_count" json:"fail_count"`
	LastAttempt time.Time `db:"last_attempt" json:"last_attempt"`
}
