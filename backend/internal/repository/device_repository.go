package repository

import (
	"context"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

// DeviceRepository handles database operations for user devices.
type DeviceRepository interface {
	Create(ctx context.Context, d *models.UserDevice) error
	GetByID(ctx context.Context, id []byte) (*models.UserDevice, error)
	GetByUserID(ctx context.Context, userID []byte) ([]models.UserDevice, error)
	GetByTokenHash(ctx context.Context, hash string) (*models.UserDevice, error)
	UpdateName(ctx context.Context, id, userID []byte, name string) error
	Delete(ctx context.Context, id, userID []byte) error
}

type deviceRepository struct {
	db *sqlx.DB
}

// NewDeviceRepository instantiates a new DeviceRepository.
func NewDeviceRepository(db *sqlx.DB) DeviceRepository {
	return &deviceRepository{db: db}
}

func (r *deviceRepository) Create(ctx context.Context,
	d *models.UserDevice,
) error {
	query := `
		INSERT INTO user_devices (id, user_id, device_token_hash,
			device_name, ip_address, user_agent, expires_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`
	_, err := r.db.ExecContext(ctx, query, d.ID, d.UserID, d.DeviceTokenHash,
		d.DeviceName, d.IPAddress, d.UserAgent, d.ExpiresAt)
	if err != nil {
		return fmt.Errorf("failed to create user device: %w", err)
	}
	return nil
}

func (r *deviceRepository) GetByID(ctx context.Context,
	id []byte,
) (*models.UserDevice, error) {
	var dev models.UserDevice
	query := `
		SELECT id, user_id, device_token_hash, device_name,
			ip_address, user_agent, created_at, expires_at
		FROM user_devices
		WHERE id = ?
	`
	err := r.db.GetContext(ctx, &dev, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get user device by ID: %w", err)
	}
	return &dev, nil
}

func (r *deviceRepository) GetByUserID(ctx context.Context,
	userID []byte,
) ([]models.UserDevice, error) {
	var devices []models.UserDevice
	query := `
		SELECT id, user_id, device_token_hash, device_name,
			ip_address, user_agent, created_at, expires_at
		FROM user_devices
		WHERE user_id = ?
	`
	err := r.db.SelectContext(ctx, &devices, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list user devices: %w", err)
	}
	return devices, nil
}

func (r *deviceRepository) GetByTokenHash(ctx context.Context,
	hash string,
) (*models.UserDevice, error) {
	var dev models.UserDevice
	query := `
		SELECT id, user_id, device_token_hash, device_name,
			ip_address, user_agent, created_at, expires_at
		FROM user_devices
		WHERE device_token_hash = ?
	`
	err := r.db.GetContext(ctx, &dev, query, hash)
	if err != nil {
		return nil, fmt.Errorf("failed to get device by token: %w", err)
	}
	return &dev, nil
}

func (r *deviceRepository) UpdateName(ctx context.Context,
	id, userID []byte, name string,
) error {
	query := `
		UPDATE user_devices
		SET device_name = ?
		WHERE id = ? AND user_id = ?
	`
	_, err := r.db.ExecContext(ctx, query, name, id, userID)
	if err != nil {
		return fmt.Errorf("failed to update user device name: %w", err)
	}
	return nil
}

func (r *deviceRepository) Delete(ctx context.Context,
	id, userID []byte,
) error {
	query := `
		DELETE FROM user_devices
		WHERE id = ? AND user_id = ?
	`
	_, err := r.db.ExecContext(ctx, query, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete user device: %w", err)
	}
	return nil
}
