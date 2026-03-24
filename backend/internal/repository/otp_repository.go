package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type OTPRepository struct {
	db *sqlx.DB
}

const (
	StatusPending  = "pending"
	StatusVerified = "verified"
	StatusExpired  = "expired"
	StatusBlocked  = "blocked"
)

func NewOTPRepository(db *sqlx.DB) OTPRepository {
	return OTPRepository{db: db}
}

/**
 * CreateOTP inserts a new OTP record into the user_otps table.
 * It expects the CodeHash to be pre-calculated by the service layer.
 */
func (r *OTPRepository) CreateOTP(ctx context.Context, otp *models.OTP) error {
	query := `
		INSERT INTO user_otps (
			email, code_hash, ip_address, user_agent, expires_at, status
		) VALUES (
			:email, :code_hash, :ip_address, :user_agent, :expires_at, :status
		)`

	_, err := r.db.NamedExecContext(ctx, query, otp)
	if err != nil {
		return fmt.Errorf("[OTPRepository] CreateOTP: %w", err)
	}
	return nil
}

/**
 * GetLatestPendingOTP retrieves the most recent active OTP for an email.
 * It uses the composite index to efficiently filter by email and status.
 */
func (r *OTPRepository) GetLatestPendingOTP(
	ctx context.Context,
	email string,
) (*models.OTP, error) {
	var otp models.OTP
	query := `
		SELECT * FROM user_otps 
		WHERE email = ? AND status = ? AND expires_at > ?
		ORDER BY created_at DESC 
		LIMIT 1`

	err := r.db.GetContext(ctx, &otp, query, email, StatusPending, time.Now())
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("[OTPRepository] GetLatestPendingOTP: %w", err)
	}
	return &otp, nil
}

/**
 * IncrementRetryCount adds 1 to the retry counter for a specific OTP ID.
 */
func (r *OTPRepository) IncrementRetryCount(ctx context.Context, id uint64) error {
	query := `UPDATE user_otps SET retries = retries + 1 WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("[OTPRepository] IncrementRetryCount: %w", err)
	}
	return nil
}

/**
 * UpdateStatus changes the status of an OTP (e.g., to 'verified' or 'blocked').
 */
func (r *OTPRepository) UpdateStatus(
	ctx context.Context,
	id uint64,
	status string,
) error {
	query := `UPDATE user_otps SET status = ? WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, status, id)
	if err != nil {
		return fmt.Errorf("[OTPRepository] UpdateStatus: %w", err)
	}
	return nil
}

/**
 * RevokeOTP marks an OTP as revoked and sets the current timestamp.
 */
func (r *OTPRepository) RevokeOTP(ctx context.Context, id uint64) error {
	query := `
		UPDATE user_otps 
		SET revoked_at = CURRENT_TIMESTAMP, status = ? 
		WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, StatusExpired, id)
	if err != nil {
		return fmt.Errorf("[OTPRepository] RevokeOTP: %w", err)
	}
	return nil
}
