package repository

import (
	"context"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type MFARepository interface {
	InsertAuthenticator(ctx context.Context, auth *models.UserAuthenticator) error
	GetAuthenticatorsByUserIDAndType(ctx context.Context,
		userID []byte, authType string) ([]models.UserAuthenticator, error)
	GetAuthenticatorList(ctx context.Context,
		userID []byte) ([]models.AuthenticatorMetadata, error)
	UpdateLastUsedAt(ctx context.Context, id []byte) error
	DeleteAuthenticator(ctx context.Context, id []byte, userID []byte) error
}

type mfaRepository struct {
	db *sqlx.DB
}

func (r *mfaRepository) InsertAuthenticator(ctx context.Context,
	auth *models.UserAuthenticator,
) error {
	query := `INSERT INTO user_authenticators (id, user_id, type, name, 
              secret_encrypted, credential_id, public_key, sign_count) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := r.db.ExecContext(ctx, query, auth.ID, auth.UserID, auth.Type,
		auth.Name, auth.SecretEncrypted, auth.CredentialID, auth.PublicKey,
		auth.SignCount)
	if err != nil {
		return fmt.Errorf("[InsertAuthenticator]: %w", err)
	}
	return nil
}

func (r *mfaRepository) GetAuthenticatorsByUserIDAndType(ctx context.Context,
	userID []byte, authType string,
) ([]models.UserAuthenticator, error) {
	var auths []models.UserAuthenticator
	query := `SELECT id, user_id, type, name, created_at, last_used_at, 
              secret_encrypted, credential_id, public_key, sign_count 
              FROM user_authenticators WHERE user_id = ? AND type = ?`
	err := r.db.SelectContext(ctx, &auths, query, userID, authType)
	if err != nil {
		return nil, fmt.Errorf("[GetAuthenticatorsByUserIDAndType]: %w", err)
	}
	return auths, nil
}

func (r *mfaRepository) GetAuthenticatorList(ctx context.Context,
	userID []byte,
) ([]models.AuthenticatorMetadata, error) {
	var auths []models.AuthenticatorMetadata
	query := `SELECT id, type, name, created_at, last_used_at 
              FROM user_authenticators WHERE user_id = ?`
	err := r.db.SelectContext(ctx, &auths, query, userID)
	if err != nil {
		return nil, fmt.Errorf("[GetAuthenticatorList]: %w", err)
	}
	return auths, nil
}

func (r *mfaRepository) UpdateLastUsedAt(ctx context.Context,
	id []byte,
) error {
	query := `UPDATE user_authenticators SET last_used_at = NOW() 
              WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("[UpdateLastUsedAt]: %w", err)
	}
	return nil
}

func (r *mfaRepository) DeleteAuthenticator(ctx context.Context,
	id []byte, userID []byte,
) error {
	query := `DELETE FROM user_authenticators WHERE id = ? AND user_id = ?`
	_, err := r.db.ExecContext(ctx, query, id, userID)
	if err != nil {
		return fmt.Errorf("[DeleteAuthenticator]: %w", err)
	}
	return nil
}

func NewMFARepository(db *sqlx.DB) MFARepository {
	return &mfaRepository{db: db}
}
