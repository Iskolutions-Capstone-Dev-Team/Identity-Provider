package repository

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type RoleRepository struct {
	db *sqlx.DB
}

// CreateRole adds a new role to the system.
func (r *RoleRepository) CreateRole(role models.Role) (sql.Result, error) {
	tx, err := r.db.Beginx()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query := "INSERT INTO roles (role_name, description) VALUES (?, ?)"
	result, err := tx.Exec(query, role.RoleName, role.Description)
	if err != nil {
		return nil, err
	}

	roleID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	if len(role.Permissions) > 0 {
		// Prepare arguments and placeholders for bulk insert
		args := make([]interface{}, 0, len(role.Permissions)*2)
		placeholders := make([]string, 0, len(role.Permissions))

		for _, perm := range role.Permissions {
			placeholders = append(placeholders, "(?, ?)")
			args = append(args, roleID, perm.ID)
		}

		// Join placeholders into a single bulk query
		bulkQuery := "INSERT INTO role_permissions " +
			"(role_id, permission_id) VALUES " +
			strings.Join(placeholders, ", ")

		// Rebind handles driver-specific placeholders (e.g., ? vs $1)
		_, err = tx.Exec(tx.Rebind(bulkQuery), args...)
		if err != nil {
			return nil, err
		}
	}

	return result, tx.Commit()
}

// GetByID retrieves a single role by its integer ID.
func (r *RoleRepository) GetByID(id int) (*models.Role, error) {
	var role models.Role
	query := `
        SELECT id, role_name, description, created_at, updated_at
        FROM roles WHERE id = ? AND deleted_at IS NULL`
	if err := r.db.Get(&role, query, id); err != nil {
		return nil, err
	}

	permMap, err := r.fetchPermissionsForRoles([]int{role.ID})
	if err == nil {
		role.Permissions = permMap[role.ID]
	}

	return &role, nil
}

// SearchRoles retrieves a list of roles from a keyword.
func (r *RoleRepository) SearchRoles(keyword string) ([]models.Role, error) {
	var roles []models.Role
	pattern := "%" + keyword + "%"
	query := `
        SELECT id, role_name, description, created_at, updated_at
        FROM roles WHERE deleted_at IS NULL AND role_name LIKE ?
        LIMIT 10
    `

	if err := r.db.Select(&roles, query, pattern); err != nil {
		return nil, err
	}

	return r.populatePermissions(roles)
}

// ListRoles returns a paginated list of active roles.
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
	if err := r.db.Select(&roles, query, searchKeyword, limit, offset); err != nil {
		return nil, err
	}

	return r.populatePermissions(roles)
}

// ListAllExceptIdP returns a paginated list of active roles excluding IdP.
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
	if err := r.db.Select(&roles, query, searchKeyword, notLike, limit, offset); err != nil {
		return nil, err
	}

	return r.populatePermissions(roles)
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
	if err != nil {
		return nil, err
	}

	roleIDs := make([]int, len(roles))
	for i := range roles {
		roleIDs[i] = roles[i].ID
	}

	permMap, err := r.fetchPermissionsForRoles(roleIDs)
	if err == nil {
		for i := range roles {
			roles[i].Permissions = permMap[roles[i].ID]
		}
	}

	return roles, nil
}

// UpdateRole modifies the description or name of an existing role.
func (r *RoleRepository) UpdateRole(role models.Role) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
        UPDATE roles 
		SET 
			role_name = ?, 
			description = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ? 
			AND deleted_at IS NULL
			AND SUBSTRING_INDEX(role_name, ':', 1) = SUBSTRING_INDEX(?, ':', 1)`
	result, err := tx.Exec(
		query,
		role.RoleName,
		role.Description,
		role.ID,
		role.RoleName,
	)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return errors.New("Forbidden role_name change or role not found.")
	}

	if _, err := tx.Exec(`DELETE FROM role_permissions WHERE role_id = ?`,
		role.ID); err != nil {
		return err
	}

	if len(role.Permissions) > 0 {
		permQuery := `
            INSERT INTO role_permissions (role_id, permission_id) 
            VALUES (?, ?)
        `
		for _, perm := range role.Permissions {
			if _, err := tx.Exec(permQuery, role.ID, perm.ID); err != nil {
				return err
			}
		}
	}

	return tx.Commit()
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

func (r *RoleRepository) populatePermissions(
	roles []models.Role,
) ([]models.Role, error) {
	roleIDs := make([]int, len(roles))
	for i := range roles {
		roleIDs[i] = roles[i].ID
	}

	permMap, err := r.fetchPermissionsForRoles(roleIDs)
	if err == nil {
		for i := range roles {
			roles[i].Permissions = permMap[roles[i].ID]
		}
	}
	return roles, nil
}

func (r *RoleRepository) fetchPermissionsForRoles(
	roleIDs []int,
) (map[int][]models.Permission, error) {
	if len(roleIDs) == 0 {
		return make(map[int][]models.Permission), nil
	}

	query, args, err := sqlx.In(`
		SELECT rp.role_id, p.id, p.permission
		FROM permissions p
		JOIN role_permissions rp ON p.id = rp.permission_id
		WHERE rp.role_id IN (?)`, roleIDs)
	if err != nil {
		return nil, err
	}

	query = r.db.Rebind(query)
	rows, err := r.db.Queryx(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	permMap := make(map[int][]models.Permission)
	for rows.Next() {
		var roleID int
		var p models.Permission
		if err := rows.Scan(&roleID, &p.ID, &p.PermissionName); err != nil {
			return nil, err
		}
		permMap[roleID] = append(permMap[roleID], p)
	}
	return permMap, nil
}

func NewRoleRepository(db *sqlx.DB) *RoleRepository {
	return &RoleRepository{db: db}
}
