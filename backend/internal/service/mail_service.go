package service

import (
	"context"
	"fmt"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
)

type MailService interface {
	SendAndSaveOTP(ctx context.Context, email string) error
	SendAndSaveInvitation(ctx context.Context, 
		email string, invType models.InvitationType) error
}

type mailService struct {
	otpRepo repository.OTPRepository
	invRepo repository.InvitationRepository
}

// SendAndSaveOTP generates, saves and sends an OTP to a user.
func (s *mailService) SendAndSaveOTP(ctx context.Context, 
	email string,
) error {
	otpCode, err := utils.GenerateOTP()
	if err != nil {
		return fmt.Errorf("[MailService] Failed to generate OTP: %w", err)
	}

	otp := &models.OTP{
		OTP:       otpCode,
		Email:     email,
		ExpiresAt: time.Now().Add(5 * time.Minute),
	}

	err = s.otpRepo.CreateOTP(ctx, otp)
	if err != nil {
		return fmt.Errorf("[MailService] Failed to save OTP: %w", err)
	}

	err = utils.SendOTPEmail(email, otpCode)
	if err != nil {
		return fmt.Errorf("[MailService] Failed to send OTP: %w", err)
	}

	return nil
}

// SendAndSaveInvitation generates, saves and sends an invitation code.
func (s *mailService) SendAndSaveInvitation(ctx context.Context, 
	email string, invType models.InvitationType,
) error {
	code, err := utils.GenerateAuthorizationCode()
	if err != nil {
		return fmt.Errorf("[MailService] Generate Auth Code: %w", err)
	}

	inv := &models.InvitationCode{
		Email:          email,
		InvitationType: invType,
		InvitationCode: code,
	}

	err = s.invRepo.CreateInvitation(ctx, inv)
	if err != nil {
		return fmt.Errorf("[MailService] Save Invitation: %w", err)
	}

	err = utils.SendInvitationEmail(email, code)
	if err != nil {
		return fmt.Errorf("[MailService] Send Invitation: %w", err)
	}

	return nil
}

func NewMailService(orp repository.OTPRepository, 
	irp repository.InvitationRepository,
) MailService {
	return &mailService{
		otpRepo: orp,
		invRepo: irp,
	}
}
