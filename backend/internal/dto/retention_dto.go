package dto

// RetentionRunResponse encapsulates the summary of a log retention lifecycle run.
type RetentionRunResponse struct {
	Status               string   `json:"status"`
	CutoffDate           string   `json:"cutoff_date"`
	AuditLogsArchived    int64    `json:"audit_logs_archived"`
	AuditLogsPurged      int64    `json:"audit_logs_purged"`
	SecurityLogsArchived int64    `json:"security_logs_archived"`
	SecurityLogsPurged   int64    `json:"security_logs_purged"`
	ArchiveFiles         []string `json:"archive_files"`
	Duration             string   `json:"duration"`
}

