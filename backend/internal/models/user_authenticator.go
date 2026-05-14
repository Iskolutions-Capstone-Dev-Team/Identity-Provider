package models

import (
	"time"
)

type UserAuthenticator struct {
	ID               []byte     `db:"id" json:"id"`
	UserID           []byte     `db:"user_id" json:"user_id"`
	Type             string     `db:"type" json:"type"`
	Name             string     `db:"name" json:"name"`
	CreatedAt        time.Time  `db:"created_at" json:"created_at"`
	LastUsedAt       *time.Time `db:"last_used_at" json:"last_used_at"`
	SecretEncrypted  []byte     `db:"secret_encrypted" json:"-"`
	CredentialID     []byte     `db:"credential_id" json:"-"`
	PublicKey        []byte     `db:"public_key" json:"-"`
	SignCount        int        `db:"sign_count" json:"sign_count"`
}

type AuthenticatorMetadata struct {
	ID         []byte     `db:"id" json:"id"`
	Type       string     `db:"type" json:"type"`
	Name       string     `db:"name" json:"name"`
	CreatedAt  time.Time  `db:"created_at" json:"created_at"`
	LastUsedAt *time.Time `db:"last_used_at" json:"last_used_at"`
}
