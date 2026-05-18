package models

import "time"

type AssignmentSource string

const (
	SourceManual      AssignmentSource = "manual"
	SourcePreapproved AssignmentSource = "preapproved"
)

type ClientAllowedUser struct {
	ClientID         []byte           `db:"client_id"`
	UserID           []byte           `db:"user_id"`
	AssignedAt       time.Time        `db:"assigned_at"`
	AssignmentSource AssignmentSource `db:"assignment_source"`
}
