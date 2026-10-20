package repository

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
)

// PasswordHistoryRepository manages data persistence for password history.
type PasswordHistoryRepository interface {
	GetRecentPasswordHashes(
		ctx context.Context,
		userID []byte,
		limit int,
	) ([]string, error)
	AddPasswordHistory(
		ctx context.Context,
		userID []byte,
		hash string,
	) error
	PrunePasswordHistory(
		ctx context.Context,
		userID []byte,
		retainCount int,
	) error
}

type passwordHistoryRepository struct {
	db *sqlx.DB
}

// NewPasswordHistoryRepository instantiates a new PasswordHistoryRepository.
func NewPasswordHistoryRepository(db *sqlx.DB) PasswordHistoryRepository {
	return &passwordHistoryRepository{db: db}
}

// GetRecentPasswordHashes fetches the latest N hashes for the given user.
func (r *passwordHistoryRepository) GetRecentPasswordHashes(
	ctx context.Context,
	userID []byte,
	limit int,
) ([]string, error) {
	if limit <= 0 {
		return []string{}, nil
	}

	query := `
		SELECT password_hash
		FROM password_histories
		WHERE user_id = ?
		ORDER BY created_at DESC, id DESC
		LIMIT ?
	`
	var hashes []string
	err := r.db.SelectContext(ctx, &hashes, query, userID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get password history: %w", err)
	}
	return hashes, nil
}

// AddPasswordHistory appends a new password hash to user history.
func (r *passwordHistoryRepository) AddPasswordHistory(
	ctx context.Context,
	userID []byte,
	hash string,
) error {
	query := `
		INSERT INTO password_histories (user_id, password_hash, created_at)
		VALUES (?, ?, NOW())
	`
	_, err := r.db.ExecContext(ctx, query, userID, hash)
	if err != nil {
		return fmt.Errorf("failed to add password history: %w", err)
	}
	return nil
}

// PrunePasswordHistory retains only the latest retainCount entries for a user.
func (r *passwordHistoryRepository) PrunePasswordHistory(
	ctx context.Context,
	userID []byte,
	retainCount int,
) error {
	if retainCount <= 0 {
		return nil
	}

	query := `
		DELETE FROM password_histories
		WHERE user_id = ?
		  AND id NOT IN (
			SELECT id FROM (
				SELECT id FROM password_histories
				WHERE user_id = ?
				ORDER BY created_at DESC, id DESC
				LIMIT ?
			) AS keep_rows
		  )
	`
	_, err := r.db.ExecContext(ctx, query, userID, userID, retainCount)
	if err != nil {
		return fmt.Errorf("failed to prune password history: %w", err)
	}
	return nil
}
