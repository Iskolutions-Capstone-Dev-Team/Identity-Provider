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
	SendOTP(ctx context.Context, email string) error
	VerifyOTP(ctx context.Context, email, code string) error
}

type otpService struct {
	otpRepo     repository.OTPRepository
	mailService MailService
}

/**
 * SendOTP generates and sends an OTP to the user, enforcing a 3-minute
 * cooldown between requests.
 */
func (s *otpService) SendOTP(ctx context.Context,
	email string,
) error {
	// Check for cooldown
	latest, err := s.otpRepo.GetLatestOTPByEmail(ctx, email)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return fmt.Errorf("[OTPService] Get latest OTP: %w", err)
	}

	if latest != nil {
		cooldown := 3 * time.Minute
		if time.Since(latest.CreatedAt) < cooldown {
			return fmt.Errorf("please wait 3 minutes before " +
				"requesting a new OTP")
		}
	}

	otpCode, err := utils.GenerateOTP()
	if err != nil {
		return fmt.Errorf("[OTPService] Generate OTP: %w", err)
	}

	otp := &models.OTP{
		OTP:       otpCode,
		Email:     email,
		ExpiresAt: time.Now().Add(5 * time.Minute),
		Attempts:  0,
	}

	err = s.otpRepo.CreateOTP(ctx, otp)
	if err != nil {
		return fmt.Errorf("[OTPService] Save OTP: %w", err)
	}

	err = utils.SendOTPEmail(email, otpCode)
	if err != nil {
		return fmt.Errorf("[OTPService] Send Email: %w", err)
	}

	return nil
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
