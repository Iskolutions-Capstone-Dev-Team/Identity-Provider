package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type RoleRepository struct {
	db *sqlx.DB
}

// CreateRole adds a new role to the system.
// @Summary Create Role
// @ID create-role
func (r *RoleRepository) CreateRole(role models.Role) (sql.Result, error) {
	query := `
        INSERT INTO roles (role_name, description)
        VALUES (?, ?)
    `
	// Auto-commits immediately if not called within a transaction
	result, err := r.db.Exec(query, role.RoleName, role.Description)
	if err != nil {
		return nil, fmt.Errorf("failed to create role: %w", err)
	}
	return result, nil
}

// GetByID retrieves a single role by its integer ID.
// @Summary Get Role by ID
// @ID get-role-by-id
func (r *RoleRepository) GetByID(id int) (*models.Role, error) {
	var role models.Role
	query := `
        SELECT id, role_name, description, created_at, updated_at
        FROM roles WHERE id = ? AND deleted_at IS NULL`
	err := r.db.Get(&role, query, id)
	return &role, err
}

// SearchRoles retrieves a list of roles from a keyword.
// @Summary Get Roles by keyword
// @ID search-role-by-name
func (r *RoleRepository) SearchRoles(keyword string) ([]models.Role, error) {
	var roles []models.Role
	pattern := "%" + keyword + "%"
	query := `
        SELECT id, role_name, description, created_at, updated_at
        FROM roles WHERE deleted_at IS NULL AND role_name LIKE ?
        LIMIT 10
    `

	err := r.db.Select(&roles, query, pattern)
	return roles, err
}

// ListRoles returns a paginated list of active roles.
// @Summary List Roles
// @ID list-roles
func (r *RoleRepository) ListRoles(limit, offset int,
	keyword string,
) ([]models.Role, error) {
	var roles []models.Role
	searchKeyword := "%" + keyword + "%"
	query := `
        SELECT id, role_name, description, created_at, updated_at FROM roles 
        WHERE deleted_at IS NULL AND role_name LIKE ?
        ORDER BY id DESC 
        LIMIT ? OFFSET ?`
	err := r.db.Select(&roles, query, searchKeyword, limit, offset)
	return roles, err
}

// ListRoles returns a paginated list of active roles.
// @Summary List Roles
// @ID list-roles
func (r *RoleRepository) ListAllExceptIdP(limit, offset int,
	keyword string,
) ([]models.Role, error) {
	var roles []models.Role
	searchKeyword := "%" + keyword + "%"
	notLike := "IDP:%"
	query := `
        SELECT id, role_name, description, created_at, updated_at 
		FROM roles 
		WHERE deleted_at IS NULL 
		AND role_name LIKE ? 
		AND role_name NOT LIKE ?
		ORDER BY id DESC 
		LIMIT ? OFFSET ?
	`
	err := r.db.Select(&roles, query, searchKeyword, notLike, limit, offset)
	return roles, err
}

func (r *RoleRepository) ListDistinctBoundRoles(
	limit int,
	offset int,
	userID []byte,
	keyword string,
) ([]models.RoleWithMetaData, error) {
	var roles []models.RoleWithMetaData
	searchKeyword := "%" + keyword + "%"
	query := `
		SELECT DISTINCT 
            r.id, r.role_name, r.description, r.created_at, r.updated_at,
            (SUBSTRING_INDEX(r.role_name, ':', 1) IN (
        SELECT c.tag 
			FROM clients c
			JOIN admin_allowed_clients aac ON c.id = aac.client_id
			WHERE aac.user_id = ?
		)) AS can_update,
		(SUBSTRING_INDEX(r.role_name, ':', 1) IN (
			SELECT c.tag 
			FROM clients c
			JOIN admin_allowed_clients aac ON c.id = aac.client_id
			WHERE aac.user_id = ?
		)) AS can_delete
        FROM roles r
        JOIN client_allowed_roles car ON r.id = car.role_id
        JOIN admin_allowed_clients aac ON car.client_id = aac.client_id
        WHERE aac.user_id = ? 
            AND r.deleted_at IS NULL 
            AND r.role_name LIKE ?
        ORDER BY r.id DESC
        LIMIT ? OFFSET ?
	`

	err := r.db.Select(
		&roles, 
		query, 
		userID, 
		userID, 
		userID, 
		searchKeyword, 
		limit, 
		offset,
	)
	return roles, err
}

// UpdateRole modifies the description or name of an existing role.
// @Summary Update Role
// @ID update-role
func (r *RoleRepository) UpdateRole(role models.Role) error {
	query := `
        UPDATE roles 
        SET role_name = ?, description = ? 
        WHERE id = ? AND deleted_at IS NULL`
	_, err := r.db.Exec(query, role.RoleName, role.Description, role.ID)
	return err
}

// Delete purges the role.
// @Summary Soft Delete Role
// @ID delete-role
func (r *RoleRepository) Delete(id int) error {
	query := `DELETE FROM roles WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

// CountRoles counts the number of roles that are not deleted.
// @Summary Count all active non deleted roles
// @ID count-roles
func (r *RoleRepository) CountRoles(keyword string) (int, error) {
	var count int
	searchKeyword := "%" + keyword + "%"
	query := `
		SELECT COUNT(*) FROM roles 
		WHERE deleted_at IS NULL AND role_name LIKE ?`
	err := r.db.Get(&count, query, searchKeyword)
	return count, err
}

func (r *RoleRepository) CountDistinctBoundRoles(
	userID []byte,
	keyword string,
) (int, error) {
	var count int
	searchKeyword := "%" + keyword + "%"

	query := `
		SELECT COUNT(DISTINCT r.id)
		FROM roles r
		JOIN client_allowed_roles car ON r.id = car.role_id
		JOIN admin_allowed_clients aac ON car.client_id = aac.client_id
		WHERE aac.user_id = ? 
			AND r.deleted_at IS NULL 
			AND r.role_name LIKE ?
	`

	err := r.db.Get(&count, query, userID, searchKeyword)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func NewRoleRepository(db *sqlx.DB) *RoleRepository {
	return &RoleRepository{db: db}
}
