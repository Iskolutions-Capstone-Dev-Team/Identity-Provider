package repository

import (
	"context"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

// PasskeyRepository manages WebAuthn credential persistence.
type PasskeyRepository interface {
	InsertPasskey(
		ctx context.Context, p *models.Passkey,
	) error
	GetPasskeysByUserID(
		ctx context.Context, userID []byte,
	) ([]models.Passkey, error)
	GetPasskeyByCredentialID(
		ctx context.Context, credentialID []byte,
	) (*models.Passkey, error)
	UpdatePasskeySignCount(
		ctx context.Context, credentialID []byte, count uint32,
	) error
	// HasPasskey reports whether the user has at least one passkey.
	HasPasskey(ctx context.Context, userID []byte) (bool, error)
}

type passkeyRepository struct {
	db *sqlx.DB
}

// InsertPasskey persists a new WebAuthn credential.
func (r *passkeyRepository) InsertPasskey(
	ctx context.Context, p *models.Passkey,
) error {
	query := `INSERT INTO user_authenticators
		(id, user_id, type, name, credential_id,
		 public_key, aaguid, transport, sign_count)
		VALUES (?, ?, 'passkey', ?, ?, ?, ?, ?, ?)`
	_, err := r.db.ExecContext(
		ctx, query,
		p.ID, p.UserID, p.Name,
		p.CredentialID, p.PublicKey,
		p.AAGUID, p.Transport, p.SignCount,
	)
	if err != nil {
		return fmt.Errorf("[InsertPasskey]: %w", err)
	}
	return nil
}

// GetPasskeysByUserID loads all passkeys registered to a user.
func (r *passkeyRepository) GetPasskeysByUserID(
	ctx context.Context, userID []byte,
) ([]models.Passkey, error) {
	var rows []models.Passkey
	query := `SELECT id, user_id, name, credential_id, public_key,
		COALESCE(aaguid, '') AS aaguid,
		COALESCE(transport, '') AS transport,
		sign_count, created_at, last_used_at
		FROM user_authenticators
		WHERE user_id = ? AND type = 'passkey'`
	err := r.db.SelectContext(ctx, &rows, query, userID)
	if err != nil {
		return nil, fmt.Errorf(
			"[GetPasskeysByUserID]: %w", err,
		)
	}
	return rows, nil
}

// GetPasskeyByCredentialID fetches a credential for assertion lookup.
func (r *passkeyRepository) GetPasskeyByCredentialID(
	ctx context.Context, credentialID []byte,
) (*models.Passkey, error) {
	var row models.Passkey
	query := `SELECT id, user_id, name, credential_id, public_key,
		COALESCE(aaguid, '') AS aaguid,
		COALESCE(transport, '') AS transport,
		sign_count, created_at, last_used_at
		FROM user_authenticators
		WHERE credential_id = ? AND type = 'passkey'
		LIMIT 1`
	err := r.db.GetContext(ctx, &row, query, credentialID)
	if err != nil {
		return nil, fmt.Errorf(
			"[GetPasskeyByCredentialID]: %w", err,
		)
	}
	return &row, nil
}

// UpdatePasskeySignCount updates the sign counter to prevent replay attacks.
func (r *passkeyRepository) UpdatePasskeySignCount(
	ctx context.Context, credentialID []byte, count uint32,
) error {
	query := `UPDATE user_authenticators
		SET sign_count = ?, last_used_at = NOW()
		WHERE credential_id = ? AND type = 'passkey'`
	_, err := r.db.ExecContext(ctx, query, count, credentialID)
	if err != nil {
		return fmt.Errorf(
			"[UpdatePasskeySignCount]: %w", err,
		)
	}
	return nil
}

// HasPasskey returns true if the user has at least one passkey.
func (r *passkeyRepository) HasPasskey(
	ctx context.Context, userID []byte,
) (bool, error) {
	var count int
	query := `SELECT COUNT(1) FROM user_authenticators
		WHERE user_id = ? AND type = 'passkey' LIMIT 1`
	err := r.db.GetContext(ctx, &count, query, userID)
	if err != nil {
		return false, fmt.Errorf("[HasPasskey]: %w", err)
	}
	return count > 0, nil
}

// NewPasskeyRepository returns a MySQL-backed PasskeyRepository.
func NewPasskeyRepository(db *sqlx.DB) PasskeyRepository {
	return &passkeyRepository{db: db}
}
