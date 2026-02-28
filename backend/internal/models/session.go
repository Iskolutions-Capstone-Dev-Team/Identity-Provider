package models

import "time"

type IdPSession struct {
	SessionId string    `db:"session_id"`
	UserId    []byte    `db:"user_id"`
	IpAddress string    `db:"ip_address"`
	UserAgent string    `db:"user_agent"`
	CreatedAt time.Time `db:"created_at"`
	ExpiresAt time.Time `db:"expires_at"`
}
