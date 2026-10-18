package models

import "time"

// PasswordHistory represents a previously used password hash for a user.
type PasswordHistory struct {
	ID           int64     `db:"id"`
	UserID       []byte    `db:"user_id"`
	PasswordHash string    `db:"password_hash"`
	CreatedAt    time.Time `db:"created_at"`
}
