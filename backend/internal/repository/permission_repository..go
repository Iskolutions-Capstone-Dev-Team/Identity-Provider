package repository

import (
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type PermissionRepository struct {
	db *sqlx.DB
}

func (r *PermissionRepository) GetAllPermissions() ([]models.Permission,
	error) {
	var permissions []models.Permission
	query := "SELECT id, permission FROM permissions"
	err := r.db.Select(&permissions, query)
	if err != nil {
		return nil, err
	}
	return permissions, nil
}

func NewPermissionRepository(db *sqlx.DB) *PermissionRepository {
	return &PermissionRepository{
		db: db,
	}
}
