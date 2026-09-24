package models

import "time"

// UserDevice represents a user device registered for bypassing MFA.
type UserDevice struct {
	ID              []byte    `db:"id"`
	UserID          []byte    `db:"user_id"`
	DeviceTokenHash string    `db:"device_token_hash"`
	DeviceName      string    `db:"device_name"`
	IPAddress       string    `db:"ip_address"`
	UserAgent       string    `db:"user_agent"`
	CreatedAt       time.Time `db:"created_at"`
	ExpiresAt       time.Time `db:"expires_at"`
}
