package repository

import (
	"context"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type OTPRepository interface {
	CreateOTP(ctx context.Context, otp *models.OTP) error
	GetOTP(ctx context.Context, code string) (*models.OTP, error)
	MarkAsUsed(ctx context.Context, code string) error
	DeleteExpiredOTPs(ctx context.Context) error
}

type otpRepository struct {
	db *sqlx.DB
}

func (r *otpRepository) CreateOTP(ctx context.Context, otp *models.OTP) error {
	query := `INSERT INTO otps (otp, user_id, expires_at) VALUES (?, ?, ?)`
	_, err := r.db.ExecContext(ctx, query, otp.OTP, otp.UserID, otp.ExpiresAt)
	if err != nil {
		return fmt.Errorf("[CreateOTP]: %w", err)
	}
	return nil
}

func (r *otpRepository) GetOTP(ctx context.Context,
	code string,
) (*models.OTP, error) {
	var otp models.OTP
	query := `SELECT otp, user_id, expires_at, used_at, created_at 
              FROM otps WHERE otp = ?`
	err := r.db.GetContext(ctx, &otp, query, code)
	if err != nil {
		return nil, fmt.Errorf("[GetOTP]: %w", err)
	}
	return &otp, nil
}

func (r *otpRepository) MarkAsUsed(ctx context.Context, code string) error {
	query := `UPDATE otps SET used_at = NOW() WHERE otp = ?`
	_, err := r.db.ExecContext(ctx, query, code)
	if err != nil {
		return fmt.Errorf("[MarkAsUsed]: %w", err)
	}
	return nil
}

func (r *otpRepository) DeleteExpiredOTPs(ctx context.Context) error {
	query := `DELETE FROM otps WHERE expires_at < NOW()`
	_, err := r.db.ExecContext(ctx, query)
	return err
}

func NewOTPRepository(db *sqlx.DB) OTPRepository {
	return &otpRepository{db: db}
}
