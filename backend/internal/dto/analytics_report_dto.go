package dto

// AnalyticsReportQuery represents query parameters for the 1-year report endpoint.
type AnalyticsReportQuery struct {
	From     string `form:"from" binding:"required"`
	To       string `form:"to" binding:"required"`
	Interval string `form:"interval"` // "day", "week", "month"
	Type     string `form:"type"`     // "all", "audit", "security"
}

// ActionCountMetric holds counts for specific actions in the report range.
type ActionCountMetric struct {
	Action string `json:"action"`
	Count  int64  `json:"count"`
}

// AnalyticsKPISummary contains aggregated overview KPIs for the specified window.
type AnalyticsKPISummary struct {
	TotalEvents        int64               `json:"total_events"`
	SuccessEvents      int64               `json:"success_events"`
	FailedEvents       int64               `json:"failed_events"`
	FailureRatePercent float64             `json:"failure_rate_percent"`
	UniqueActors       int64               `json:"unique_actors"`
	TopActions         []ActionCountMetric `json:"top_actions"`
}

// TimeseriesPoint represents aggregated metric buckets across time.
type TimeseriesPoint struct {
	Bucket  string `json:"bucket"`
	Total   int64  `json:"total"`
	Success int64  `json:"success"`
	Fail    int64  `json:"fail"`
}

// AnalyticsReportResponse represents the structured JSON response for reports up to 1 year.
type AnalyticsReportResponse struct {
	From       string              `json:"from"`
	To         string              `json:"to"`
	Interval   string              `json:"interval"`
	Type       string              `json:"type"`
	Summary    AnalyticsKPISummary `json:"summary"`
	Timeseries []TimeseriesPoint   `json:"timeseries"`
}

// ReportExportQuery represents query parameters for streaming CSV report downloads.
type ReportExportQuery struct {
	From string `form:"from" binding:"required"`
	To   string `form:"to" binding:"required"`
	Type string `form:"type"` // "all", "audit", "security"
}

