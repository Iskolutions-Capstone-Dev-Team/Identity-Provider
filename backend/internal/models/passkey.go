package models

import "time"

// Passkey represents a stored WebAuthn credential.
type Passkey struct {
	ID           []byte     `db:"id"`
	UserID       []byte     `db:"user_id"`
	Name         string     `db:"name"`
	CredentialID []byte     `db:"credential_id"`
	PublicKey    []byte     `db:"public_key"`
	AAGUID       string     `db:"aaguid"`
	Transport    string     `db:"transport"`
	SignCount    uint32     `db:"sign_count"`
	CreatedAt    time.Time  `db:"created_at"`
	LastUsedAt   *time.Time `db:"last_used_at"`
}
