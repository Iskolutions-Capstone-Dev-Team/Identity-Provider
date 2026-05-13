package service

import (
	"context"
	"fmt"
	"net/url"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type MFAService interface {
	GenerateTOTPSetup(ctx context.Context, 
		email string) (string, string, error)
	FinalizeTOTP(ctx context.Context, userID []byte, 
		secret, code, name string) ([]string, error)
	SetupTOTP(ctx context.Context, userID []byte, 
		email string) (string, []string, error)
	VerifyCode(ctx context.Context, userID []byte, 
		code string) (bool, error)
	GetAuthenticatorList(ctx context.Context, 
		userID []byte) ([]models.AuthenticatorMetadata, error)
	RemoveAuthenticator(ctx context.Context, 
		id []byte, userID []byte) error
}

type mfaService struct {
	mfaRepo repository.MFARepository
}

func (s *mfaService) GenerateTOTPSetup(ctx context.Context,
	email string,
) (string, string, error) {
	secret, err := utils.GenerateTOTPSecret()
	if err != nil {
		return "", "", fmt.Errorf("[MFAService] Secret Gen: %w", err)
	}

	issuer := "Identity-Provider"
	uri := fmt.Sprintf("otpauth://totp/%s:%s?secret=%s&issuer=%s",
		issuer, email, secret, url.QueryEscape(issuer))

	return secret, uri, nil
}

func (s *mfaService) FinalizeTOTP(ctx context.Context, userID []byte,
	secret, code, name string,
) ([]string, error) {
	// Verify the code first
	expected, err := utils.ComputeTOTP(secret)
	if err != nil {
		return nil, fmt.Errorf("[MFAService] TOTP Compute: %w", err)
	}

	if expected != code {
		return nil, fmt.Errorf("invalid verification code")
	}

	encryptedSecret, err := utils.Encrypt([]byte(secret))
	if err != nil {
		return nil, fmt.Errorf("[MFAService] Encrypt: %w", err)
	}

	id := uuid.New()
	auth := &models.UserAuthenticator{
		ID:              id[:],
		UserID:          userID,
		Type:            "totp",
		Name:            name,
		SecretEncrypted: encryptedSecret,
	}

	err = s.mfaRepo.InsertAuthenticator(ctx, auth)
	if err != nil {
		return nil, fmt.Errorf("[MFAService] DB Insert: %w", err)
	}

	return s.generateBackupCodes(ctx, userID)
}

func (s *mfaService) SetupTOTP(ctx context.Context, userID []byte,
	email string,
) (string, []string, error) {
	secret, err := utils.GenerateTOTPSecret()
	if err != nil {
		return "", nil, fmt.Errorf("[MFAService] Secret Gen: %w", err)
	}

	encryptedSecret, err := utils.Encrypt([]byte(secret))
	if err != nil {
		return "", nil, fmt.Errorf("[MFAService] Encrypt: %w", err)
	}

	id := uuid.New()
	auth := &models.UserAuthenticator{
		ID:              id[:],
		UserID:          userID,
		Type:            "totp",
		Name:            "TOTP Authenticator",
		SecretEncrypted: encryptedSecret,
	}

	err = s.mfaRepo.InsertAuthenticator(ctx, auth)
	if err != nil {
		return "", nil, fmt.Errorf("[MFAService] DB Insert: %w", err)
	}

	// Generate backup codes
	backupCodes, err := s.generateBackupCodes(ctx, userID)
	if err != nil {
		return "", nil, fmt.Errorf("[MFAService] Backup Codes: %w", err)
	}

	issuer := "Identity-Provider"
	uri := fmt.Sprintf("otpauth://totp/%s:%s?secret=%s&issuer=%s",
		issuer, email, secret, url.QueryEscape(issuer))

	return uri, backupCodes, nil
}

func (s *mfaService) generateBackupCodes(ctx context.Context,
	userID []byte,
) ([]string, error) {
	codes := make([]string, 10)
	for i := 0; i < 10; i++ {
		raw, err := utils.GenerateRandomString(8)
		if err != nil {
			return nil, err
		}
		codes[i] = raw

		hashed, err := bcrypt.GenerateFromPassword([]byte(raw), 12)
		if err != nil {
			return nil, err
		}

		id := uuid.New()
		auth := &models.UserAuthenticator{
			ID:              id[:],
			UserID:          userID,
			Type:            "backup_code",
			Name:            "Backup Code",
			SecretEncrypted: hashed,
		}

		err = s.mfaRepo.InsertAuthenticator(ctx, auth)
		if err != nil {
			return nil, err
		}
	}
	return codes, nil
}

func (s *mfaService) VerifyCode(ctx context.Context, userID []byte,
	code string,
) (bool, error) {
	if len(code) == 6 {
		// TOTP
		auths, err := s.mfaRepo.GetAuthenticatorsByUserIDAndType(ctx,
			userID, "totp")
		if err != nil {
			return false, fmt.Errorf("[MFAService] DB Fetch: %w", err)
		}

		for _, auth := range auths {
			decrypted, err := utils.Decrypt(auth.SecretEncrypted)
			if err != nil {
				continue
			}

			expected, err := utils.ComputeTOTP(string(decrypted))
			if err != nil {
				continue
			}

			if expected == code {
				s.mfaRepo.UpdateLastUsedAt(ctx, auth.ID)
				return true, nil
			}
		}
	} else {
		// Backup Code
		auths, err := s.mfaRepo.GetAuthenticatorsByUserIDAndType(ctx,
			userID, "backup_code")
		if err != nil {
			return false, fmt.Errorf("[MFAService] DB Fetch: %w", err)
		}

		for _, auth := range auths {
			err = bcrypt.CompareHashAndPassword(auth.SecretEncrypted,
				[]byte(code))
			if err == nil {
				s.mfaRepo.DeleteAuthenticator(ctx, auth.ID, userID)
				return true, nil
			}
		}
	}

	return false, nil
}

func (s *mfaService) GetAuthenticatorList(ctx context.Context,
	userID []byte,
) ([]models.AuthenticatorMetadata, error) {
	return s.mfaRepo.GetAuthenticatorList(ctx, userID)
}

func (s *mfaService) RemoveAuthenticator(ctx context.Context,
	id []byte, userID []byte,
) error {
	return s.mfaRepo.DeleteAuthenticator(ctx, id, userID)
}

func NewMFAService(mfaRepo repository.MFARepository) MFAService {
	return &mfaService{mfaRepo: mfaRepo}
}
