package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/google/uuid"
)

// DeviceService manages user device validation, list, and updates.
type DeviceService interface {
	RegisterDevice(ctx context.Context, userID uuid.UUID, ip, ua string) (string, error)
	VerifyDevice(ctx context.Context, userID uuid.UUID, token string) (bool, error)
	ListDevices(ctx context.Context, userID uuid.UUID) ([]dto.UserDeviceResponse, error)
	UpdateDeviceName(ctx context.Context, id uuid.UUID, userID uuid.UUID, name string) error
	DeleteDevice(ctx context.Context, id uuid.UUID, userID uuid.UUID) error
}

type deviceService struct {
	repo repository.DeviceRepository
}

// NewDeviceService instantiates a new DeviceService.
func NewDeviceService(repo repository.DeviceRepository) DeviceService {
	return &deviceService{repo: repo}
}

func (s *deviceService) RegisterDevice(ctx context.Context,
	userID uuid.UUID, ip, ua string,
) (string, error) {
	token, err := utils.GenerateRandomString(32)
	if err != nil {
		return "", fmt.Errorf("failed to generate device token: %w", err)
	}

	hash := sha256.Sum256([]byte(token))
	hashStr := hex.EncodeToString(hash[:])

	id, err := uuid.NewRandom()
	if err != nil {
		return "", fmt.Errorf("failed to generate uuid for device: %w", err)
	}

	deviceName := parseUserAgent(ua)
	expiresAt := time.Now().AddDate(0, 0, 30)

	device := &models.UserDevice{
		ID:              id[:],
		UserID:          userID[:],
		DeviceTokenHash: hashStr,
		DeviceName:      deviceName,
		IPAddress:       ip,
		UserAgent:       ua,
		ExpiresAt:       expiresAt,
	}

	if err := s.repo.Create(ctx, device); err != nil {
		return "", err
	}

	return token, nil
}

func (s *deviceService) VerifyDevice(ctx context.Context,
	userID uuid.UUID, token string,
) (bool, error) {
	hash := sha256.Sum256([]byte(token))
	hashStr := hex.EncodeToString(hash[:])

	dev, err := s.repo.GetByTokenHash(ctx, hashStr)
	if err != nil {
		return false, nil // Device token hash not found
	}

	// Verify that the device belongs to the user
	if hex.EncodeToString(dev.UserID) != hex.EncodeToString(userID[:]) {
		return false, nil
	}

	// Verify the device token is not expired
	if time.Now().After(dev.ExpiresAt) {
		return false, nil
	}

	return true, nil
}

func (s *deviceService) ListDevices(ctx context.Context,
	userID uuid.UUID,
) ([]dto.UserDeviceResponse, error) {
	devices, err := s.repo.GetByUserID(ctx, userID[:])
	if err != nil {
		return nil, err
	}

	var resp []dto.UserDeviceResponse
	for _, d := range devices {
		idVal, err := uuid.FromBytes(d.ID)
		if err != nil {
			continue
		}
		resp = append(resp, dto.UserDeviceResponse{
			ID:        idVal.String(),
			Name:      d.DeviceName,
			IPAddress: d.IPAddress,
			UserAgent: d.UserAgent,
			CreatedAt: d.CreatedAt,
			ExpiresAt: d.ExpiresAt,
		})
	}
	return resp, nil
}

func (s *deviceService) UpdateDeviceName(ctx context.Context,
	id uuid.UUID, userID uuid.UUID, name string,
) error {
	return s.repo.UpdateName(ctx, id[:], userID[:], name)
}

func (s *deviceService) DeleteDevice(ctx context.Context,
	id uuid.UUID, userID uuid.UUID,
) error {
	return s.repo.Delete(ctx, id[:], userID[:])
}

func parseUserAgent(ua string) string {
	os := "Unknown OS"
	if strings.Contains(ua, "Windows") {
		os = "Windows"
	} else if strings.Contains(ua, "Macintosh") ||
		strings.Contains(ua, "Mac OS X") {
		os = "macOS"
	} else if strings.Contains(ua, "Linux") {
		os = "Linux"
	} else if strings.Contains(ua, "Android") {
		os = "Android"
	} else if strings.Contains(ua, "iPhone") ||
		strings.Contains(ua, "iPad") {
		os = "iOS"
	}

	browser := "Unknown Browser"
	if strings.Contains(ua, "Firefox") {
		browser = "Firefox"
	} else if strings.Contains(ua, "Chrome") {
		browser = "Chrome"
	} else if strings.Contains(ua, "Safari") &&
		!strings.Contains(ua, "Chrome") {
		browser = "Safari"
	} else if strings.Contains(ua, "Edge") {
		browser = "Edge"
	} else if strings.Contains(ua, "OPR") ||
		strings.Contains(ua, "Opera") {
		browser = "Opera"
	}

	return browser + " on " + os
}
