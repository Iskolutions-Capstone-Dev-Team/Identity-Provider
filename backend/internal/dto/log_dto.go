package dto

import (
	"encoding/json"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
)

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
	Actor     *string         `json:"actor"`
	Action    string          `json:"action" validate:"required"`
	Target    string          `json:"target" validate:"required"`
	Status    string          `json:"status" validate:"oneof=success fail"`
	Metadata  json.RawMessage `json:"metadata" swaggertype:"object"`
	CreatedAt time.Time       `json:"timestamp"`
}

// GetAuditLogListRequest defines the structure for querying a list of logs.
type GetAuditLogListResponse struct {
	AuditLogs   []PostAuditLogRequest
	TotalCount  int64
	CurrentPage int
	LastPage    int
}

// PaginatedLoginsResponse defines the response structure for paginated logins.
type PaginatedLoginsResponse struct {
	Logins      []models.AuditLog `json:"logins"`
	TotalCount  int64             `json:"total_count"`
	CurrentPage int               `json:"current_page"`
	LastPage    int               `json:"last_page"`
}
