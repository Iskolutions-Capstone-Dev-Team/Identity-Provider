package models

import (
	"time"
)

type OTP struct {
	OTP       string     `db:"otp"`
	UserID    []byte     `db:"user_id"`
	ExpiresAt time.Time  `db:"expires_at"`
	UsedAt    *time.Time `db:"used_at"`
	Attempts  int        `db:"attempts"`
	CreatedAt time.Time  `db:"created_at"`
}
