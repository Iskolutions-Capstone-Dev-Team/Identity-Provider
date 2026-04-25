package models

import (
	"time"
)

// AuditLog represents a single entry in the audit_logs table.
type AuditLog struct {
	ID        int64     `db:"id"`
	Actor     *string   `db:"actor"`
	Action    string    `db:"action"`
	Target    string    `db:"target"`
	Status    string    `db:"status"`
	Metadata  []byte    `db:"metadata"`
	CreatedAt time.Time `db:"created_at"`
}

const (
	StatusSuccess = "success"
	StatusFail    = "fail"
)
