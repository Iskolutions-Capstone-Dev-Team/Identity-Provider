package models

import "time"

type OTP struct {
	ID        uint64     `db:"id" json:"id"`
	Email     string     `db:"email" json:"email"`
	CodeHash  string     `db:"code_hash" json:"-"`
	Retries   int        `db:"retries" json:"retries"`
	Status    string     `db:"status" json:"status"`
	IPAddress string     `db:"ip_address" json:"ip_address"`
	UserAgent string     `db:"user_agent" json:"user_agent"`
	CreatedAt time.Time  `db:"created_at" json:"created_at"`
	ExpiresAt time.Time  `db:"expires_at" json:"expires_at"`
	RevokedAt *time.Time `db:"revoked_at" json:"revoked_at,omitempty"`
}
