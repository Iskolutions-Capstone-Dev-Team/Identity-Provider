package dto

import "encoding/json"

// GetAuditLogRequest defines the data for querying audit logs.
type GetAuditLogRequest struct {
	Actor    *string         `json:"actor" query:"actor"`
	Action   string          `json:"action" query:"action"`
	Target   string          `json:"target" query:"target"`
	Status   string          `json:"status" query:"status"`
	Metadata json.RawMessage `json:"metadata" query:"metadata"`
}

// PostAuditLogRequest defines the data for creating a new audit log.
type PostAuditLogRequest struct {
	Actor    *string         `json:"actor"`
	Action   string          `json:"action" validate:"required"`
	Target   string          `json:"target" validate:"required"`
	Status   string          `json:"status" validate:"oneof=success fail"`
	Metadata json.RawMessage `json:"metadata"`
}

// GetAuditLogListRequest defines the structure for querying a list of logs.
type GetAuditLogListRequest struct {
	AuditLogs   []GetAuditLogRequest
	TotalCount  int
	CurrentPage int
	LastPage    int
}
