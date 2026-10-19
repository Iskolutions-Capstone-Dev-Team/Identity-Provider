package service_test

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

// TestRegisterDevice verifies device registration.
func TestRegisterDevice(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockDeviceRepository(ctrl)
	deviceSvc := service.NewDeviceService(mockRepo)

	userID := uuid.New()
	ip := "192.168.1.1"
	ua := "Mozilla/5.0 (Windows NT 10.0) Chrome/120.0.0.0 Safari/537.36"

	mockRepo.EXPECT().Create(gomock.Any(), gomock.Any()).
		DoAndReturn(func(ctx context.Context, d *models.UserDevice) error {
			if d.DeviceName != "Chrome on Windows" {
				t.Errorf("expected Chrome on Windows, got %s", d.DeviceName)
			}
			if d.IPAddress != ip {
				t.Errorf("expected IPAddress %s, got %s", ip, d.IPAddress)
			}
			if d.UserAgent != ua {
				t.Errorf("expected UserAgent %s, got %s", ua, d.UserAgent)
			}
			return nil
		}).Times(1)

	token, err := deviceSvc.RegisterDevice(
		context.Background(),
		userID,
		ip,
		ua,
	)
	if err != nil {
		t.Fatalf("failed to register device: %v", err)
	}

	if len(token) != 43 {
		t.Errorf("expected token length 43, got %d", len(token))
	}
}

// TestVerifyDevice verifies device validation logic.
func TestVerifyDevice(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockDeviceRepository(ctrl)
	deviceSvc := service.NewDeviceService(mockRepo)

	userID := uuid.New()
	token := "sample-token-string-32-chars-long"
	hash := sha256.Sum256([]byte(token))
	hashStr := hex.EncodeToString(hash[:])

	// 1. Success case
	t.Run("Valid device", func(t *testing.T) {
		mockRepo.EXPECT().GetByTokenHash(gomock.Any(), hashStr).
			Return(&models.UserDevice{
				UserID:    userID[:],
				ExpiresAt: time.Now().Add(time.Hour),
			}, nil).Times(1)

		valid, err := deviceSvc.VerifyDevice(
			context.Background(),
			userID,
			token,
		)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !valid {
			t.Error("expected device to be valid")
		}
	})

	// 2. Expired case
	t.Run("Expired device", func(t *testing.T) {
		mockRepo.EXPECT().GetByTokenHash(gomock.Any(), hashStr).
			Return(&models.UserDevice{
				UserID:    userID[:],
				ExpiresAt: time.Now().Add(-time.Hour),
			}, nil).Times(1)

		valid, err := deviceSvc.VerifyDevice(
			context.Background(),
			userID,
			token,
		)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if valid {
			t.Error("expected device to be invalid (expired)")
		}
	})

	// 3. User mismatch case
	t.Run("User mismatch", func(t *testing.T) {
		anotherUser := uuid.New()
		mockRepo.EXPECT().GetByTokenHash(gomock.Any(), hashStr).
			Return(&models.UserDevice{
				UserID:    anotherUser[:],
				ExpiresAt: time.Now().Add(time.Hour),
			}, nil).Times(1)

		valid, err := deviceSvc.VerifyDevice(
			context.Background(),
			userID,
			token,
		)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if valid {
			t.Error("expected device to be invalid (user mismatch)")
		}
	})
}

// TestListDevices verifies listing user devices including empty state.
func TestListDevices(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockDeviceRepository(ctrl)
	deviceSvc := service.NewDeviceService(mockRepo)

	userID := uuid.New()
	devID := uuid.New()

	t.Run("Devices exist", func(t *testing.T) {
		mockRepo.EXPECT().GetByUserID(gomock.Any(), userID[:]).
			Return([]models.UserDevice{
				{
					ID:         devID[:],
					UserID:     userID[:],
					DeviceName: "Test Device",
					IPAddress:  "127.0.0.1",
					UserAgent:  "TestAgent",
					CreatedAt:  time.Now(),
					ExpiresAt:  time.Now().Add(time.Hour),
				},
			}, nil).Times(1)

		resp, err := deviceSvc.ListDevices(context.Background(), userID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(resp) != 1 {
			t.Fatalf("expected 1 device, got %d", len(resp))
		}
		if resp[0].ID != devID.String() {
			t.Errorf("expected device ID %s, got %s", devID, resp[0].ID)
		}
	})

	t.Run("Empty devices returns non-nil slice", func(t *testing.T) {
		mockRepo.EXPECT().GetByUserID(gomock.Any(), userID[:]).
			Return([]models.UserDevice{}, nil).Times(1)

		resp, err := deviceSvc.ListDevices(context.Background(), userID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil {
			t.Fatal("expected non-nil slice, got nil")
		}
		if len(resp) != 0 {
			t.Fatalf("expected 0 devices, got %d", len(resp))
		}
	})
}

// TestUpdateDeviceName verifies renaming a trusted device.
func TestUpdateDeviceName(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockDeviceRepository(ctrl)
	deviceSvc := service.NewDeviceService(mockRepo)

	userID := uuid.New()
	devID := uuid.New()
	newName := "Renamed Device"

	mockRepo.EXPECT().UpdateName(
		gomock.Any(), devID[:], userID[:], newName,
	).Return(nil).Times(1)

	err := deviceSvc.UpdateDeviceName(
		context.Background(), devID, userID, newName,
	)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

// TestDeleteDevice verifies deleting a trusted device.
func TestDeleteDevice(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockDeviceRepository(ctrl)
	deviceSvc := service.NewDeviceService(mockRepo)

	userID := uuid.New()
	devID := uuid.New()

	mockRepo.EXPECT().Delete(
		gomock.Any(), devID[:], userID[:],
	).Return(nil).Times(1)

	err := deviceSvc.DeleteDevice(context.Background(), devID, userID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

