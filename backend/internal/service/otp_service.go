package service

import (
	"context"
	"fmt"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
)

const (
	OTPLength     = 6
	OTPExpiryMins = 3
	MaxOTPRetries = 3
)

type OTPService struct {
	Repo repository.OTPRepository
}

func NewOTPService(repo repository.OTPRepository) OTPService {
	return OTPService{Repo: repo}
}

/**
 * GenerateOTP creates a 6-digit code, hashes it, and saves the record.
 */
func (s *OTPService) GenerateOTP(
	ctx context.Context,
	req dto.OTPRequest,
) (*dto.OTPResponse, error) {
	rawCode, err := utils.GenerateSecureCode(OTPLength)
	if err != nil {
		return nil, fmt.Errorf("[OTPService] GenerateOTP (SecureCode): %w", err)
	}

	expiry := time.Now().Add(time.Minute * OTPExpiryMins)

	otp := &models.OTP{
		Email:     req.Email,
		CodeHash:  utils.HashCode(rawCode),
		Status:    repository.StatusPending,
		ExpiresAt: expiry,
	}

	err = s.Repo.CreateOTP(ctx, otp)
	if err != nil {
		return nil, fmt.Errorf("[OTPService] GenerateOTP (Save): %w", err)
	}

	//TODO: mail the otp

	return &dto.OTPResponse{
		Message:   "OTP sent successfully",
		ExpiresAt: expiry,
	}, nil
}

/**
 * VerifyOTP checks the provided code against the latest pending hash.
 */
func (s *OTPService) VerifyOTP(
	ctx context.Context,
	req dto.PostOTPVerifyRequest,
) (bool, error) {
	otp, err := s.Repo.GetLatestPendingOTP(ctx, req.Email)
	if err != nil {
		return false, fmt.Errorf("[OTPService] VerifyOTP (Lookup): %w", err)
	}
	if otp == nil {
		return false, nil
	}

	inputHash := utils.HashCode(req.Code)
	if otp.CodeHash != inputHash {
		s.handleFailedAttempt(ctx, otp)
		return false, nil
	}

	err = s.Repo.UpdateStatus(ctx, otp.ID, repository.StatusVerified)
	if err != nil {
		return false, fmt.Errorf("[OTPService] VerifyOTP (Update): %w", err)
	}

	return true, nil
}

func (s *OTPService) handleFailedAttempt(ctx context.Context, otp *models.OTP) {
	newRetryCount := otp.Retries + 1
	if newRetryCount >= MaxOTPRetries {
		_ = s.Repo.UpdateStatus(ctx, otp.ID, repository.StatusBlocked)
	} else {
		_ = s.Repo.IncrementRetryCount(ctx, otp.ID)
	}
}
