package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
)

type OTPService interface {
	SendOTP(ctx context.Context, email string) (int, bool, error)
	VerifyOTP(ctx context.Context, email, code string) error
}

type otpService struct {
	otpRepo     repository.OTPRepository
	mailService MailService
}

// SendOTP generates and sends an OTP, reusing any unexpired OTP if present.
func (s *otpService) SendOTP(ctx context.Context,
	email string,
) (int, bool, error) {
	latest, err := s.otpRepo.GetLatestOTPByEmail(ctx, email)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return 0, false, fmt.Errorf("[OTPService] Get latest OTP: %w", err)
	}

	// If there is an active (unexpired and unused) OTP, reuse it.
	if latest != nil && latest.UsedAt == nil &&
		time.Now().Before(latest.ExpiresAt) {
		remaining := int(time.Until(latest.ExpiresAt).Seconds())
		if remaining < 0 {
			remaining = 0
		}
		return remaining, true, nil
	}

	otpCode, err := utils.GenerateOTP()
	if err != nil {
		return 0, false, fmt.Errorf("[OTPService] Generate OTP: %w", err)
	}

	otp := &models.OTP{
		OTP:       otpCode,
		Email:     email,
		ExpiresAt: time.Now().Add(5 * time.Minute),
		Attempts:  0,
	}

	err = s.otpRepo.CreateOTP(ctx, otp)
	if err != nil {
		return 0, false, fmt.Errorf("[OTPService] Save OTP: %w", err)
	}

	err = utils.SendOTPEmail(email, otpCode)
	if err != nil {
		return 0, false, fmt.Errorf("[OTPService] Send Email: %w", err)
	}

	return 300, false, nil
}

/**
 * VerifyOTP checks if the provided OTP matches the latest OTP for the
 * user, respecting retry limits.
 */
func (s *otpService) VerifyOTP(ctx context.Context,
	email, code string,
) error {
	otp, err := s.otpRepo.GetLatestOTPByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("no OTP found for user")
		}
		return fmt.Errorf("[OTPService] Get OTP: %w", err)
	}

	if otp.UsedAt != nil {
		return errors.New("OTP has already been used")
	}

	if time.Now().After(otp.ExpiresAt) {
		return errors.New("OTP has expired")
	}

	if otp.Attempts >= 3 {
		return errors.New("maximum retry attempts reached")
	}

	if otp.OTP != code {
		err = s.otpRepo.IncrementAttempts(ctx, otp.OTP)
		if err != nil {
			return fmt.Errorf("[OTPService] Increment attempts: %w", err)
		}
		return errors.New("invalid OTP code")
	}

	err = s.otpRepo.MarkAsUsed(ctx, otp.OTP)
	if err != nil {
		return fmt.Errorf("[OTPService] Mark OTP as used: %w", err)
	}

	return nil
}

func NewOTPService(orp repository.OTPRepository,
	ms MailService,
) OTPService {
	return &otpService{
		otpRepo:     orp,
		mailService: ms,
	}
}
