package repository

import (
	"context"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type PermissionRepository interface {
	GetAllPermissions(ctx context.Context) ([]models.Permission, error)
}

type permissionRepository struct {
	db *sqlx.DB
}

func (r *permissionRepository) GetAllPermissions(ctx context.Context,
) ([]models.Permission, error) {
	var permissions []models.Permission
	query := "SELECT id, permission FROM permissions"
	err := r.db.SelectContext(ctx, &permissions, query)
	if err != nil {
		return nil, err
	}
	return permissions, nil
}

func NewPermissionRepository(db *sqlx.DB) PermissionRepository {
	return &permissionRepository{
		db: db,
	}
}
