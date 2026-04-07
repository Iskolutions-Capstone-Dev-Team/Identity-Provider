package models

import "time"

type ClientAllowedUser struct {
	ClientID   []byte    `db:"client_id"`
	UserID     []byte    `db:"user_id"`
	AssignedAt time.Time `db:"assigned_at"`
}
