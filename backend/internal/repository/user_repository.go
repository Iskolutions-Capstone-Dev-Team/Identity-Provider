package repository

import (
	"encoding/json"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type UserRepository struct {
	db *sqlx.DB
}

type userRow struct {
	models.User
	RID   *int    `db:"role_id"`
	RName *string `db:"role_name"`
	RDesc *string `db:"role_description"`
}

// GetUserList retrieves a paginated list of non-deleted users.
func (r *UserRepository) GetUserList(limit, offset int) ([]models.User, error) {
	// 1. Fetch only the IDs for the current page
	var ids [][]byte
	idQuery := `SELECT id FROM users WHERE deleted_at IS NULL LIMIT ? OFFSET ?`

	err := r.db.Select(&ids, idQuery, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("[GetUserList] ID Fetch: %w", err)
	}

	if len(ids) == 0 {
		return []models.User{}, nil
	}

	// 2. Fetch all data + roles for ONLY those specific IDs
	// sqlx.In handles the IN (?) expansion for the slice of []byte
	fullQuery, args, err := sqlx.In(`
        SELECT u.id, u.first_name, u.middle_name, u.last_name, 
               u.name_suffix, u.email, u.status, u.created_at, 
               u.updated_at, r.id AS role_id, r.role_name AS role_name, 
               r.description AS role_description
        FROM users u
        LEFT JOIN user_roles ur ON ur.user_id = u.id
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE u.id IN (?) AND u.deleted_at IS NULL
        ORDER BY u.created_at DESC`, ids)
	if err != nil {
		return nil, fmt.Errorf("[GetUserList] Query Expansion: %w", err)
	}

	fullQuery = r.db.Rebind(fullQuery)

	var rows []userRow
	err = r.db.Select(&rows, fullQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("[GetUserList] Database Join: %w", err)
	}

	return r.groupRows(rows, ids), nil
}

/**
 * GetBoundUserList retrieves a paginated list of users, always
 * including the requesting admin. Roles are strictly filtered
 * to only those permitted by the admin's client scope.
 */
func (r *UserRepository) GetBoundUserList(
	limit,
	offset int,
	adminID []byte,
) ([]models.User, error) {
	var ids [][]byte

	// 1. Fetch user IDs (bound users + the admin themselves)
	const idQuery = `
		SELECT id FROM (
			SELECT u.id 
			FROM users u
			JOIN user_roles ur ON u.id = ur.user_id
			JOIN client_allowed_roles car ON ur.role_id = car.role_id
			JOIN admin_allowed_clients aac 
				ON car.client_id = aac.client_id
			WHERE aac.user_id = ? AND u.deleted_at IS NULL
			UNION
			SELECT id FROM users 
			WHERE id = ? AND deleted_at IS NULL
		) AS bound_users
		LIMIT ? OFFSET ?
	`

	err := r.db.Select(
		&ids,
		idQuery,
		adminID,
		adminID,
		limit,
		offset,
	)
	if err != nil {
		return nil, fmt.Errorf("[GetBoundUserList] {ID Fetch}: %w", err)
	}

	if len(ids) == 0 {
		return []models.User{}, nil
	}

	// 2. Fetch full data using LEFT JOIN on a filtered roles subquery.
	// This ensures users without allowed roles (like the admin) still
	// appear, but any unauthorized roles are completely stripped out.
	const baseQuery = `
		SELECT u.id, u.first_name, u.middle_name, 
		       u.last_name, u.name_suffix, u.email, u.status, u.created_at, 
		       u.updated_at, ar.id AS role_id, 
		       ar.role_name AS role_name, 
		       ar.description AS role_description
		FROM users u
		LEFT JOIN (
			SELECT ur.user_id, r.id, r.role_name, r.description
			FROM user_roles ur
			JOIN roles r ON ur.role_id = r.id
			JOIN client_allowed_roles car ON r.id = car.role_id
			JOIN admin_allowed_clients aac 
				ON car.client_id = aac.client_id
			WHERE aac.user_id = ?
		) ar ON ar.user_id = u.id
		WHERE u.id IN (?) AND u.deleted_at IS NULL
		ORDER BY u.created_at DESC
	`

	// Note: adminID maps to the first '?' in the subquery,
	// ids maps to the '?' in the outer WHERE IN clause.
	fullQuery, args, err := sqlx.In(baseQuery, adminID, ids)
	if err != nil {
		return nil, fmt.Errorf(
			"[GetBoundUserList] {Query Expansion}: %w",
			err,
		)
	}

	fullQuery = r.db.Rebind(fullQuery)

	var rows []userRow
	err = r.db.Select(&rows, fullQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("[GetBoundUserList] {Database Join}: %w", err)
	}

	return r.groupRows(rows, ids), nil
}

// GetUserByEmail finds a user by email, including the hash and roles.
func (r *UserRepository) GetUserByEmail(email string) (*models.User, error) {
	var rows []userRow
	query := `
        SELECT u.id, u.first_name, u.middle_name, u.last_name,
               u.name_suffix, u.email, u.password_hash, u.status, 
               u.created_at, u.updated_at, r.id AS role_id, 
               r.name AS role_name, r.description AS role_description
        FROM users u
        LEFT JOIN user_roles ur ON ur.user_id = u.id
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE u.email = ? AND u.deleted_at IS NULL`

	err := r.db.Select(&rows, query, email)
	if err != nil {
		return nil, fmt.Errorf("[GetUserByEmail] Database Query: %w", err)
	}

	if len(rows) == 0 {
		return nil, nil
	}

	return r.mapSingleUser(rows), nil
}

// GetUserById retrieves a specific user by binary UUID including roles.
func (r *UserRepository) GetUserById(id []byte) (*models.User, error) {
	var rows []userRow
	query := `
        SELECT u.id, u.first_name, u.middle_name, u.last_name,
               u.name_suffix, u.email, u.status, u.created_at, 
               u.updated_at, r.id AS role_id, r.role_name AS role_name, 
               r.description AS role_description
        FROM users u
        LEFT JOIN user_roles ur ON ur.user_id = u.id
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE u.id = ? AND u.deleted_at IS NULL`

	err := r.db.Select(&rows, query, id)
	if err != nil {
		return nil, fmt.Errorf("[GetUserById] Database Query: %w", err)
	}

	if len(rows) == 0 {
		return nil, nil
	}

	return r.mapSingleUser(rows), nil
}

// CreateUser executes a stored procedure to handle User and Roles atomically.
func (r *UserRepository) CreateUser(u *models.User) error {
	rolesJSON, err := json.Marshal(u.RoleString)
	if err != nil {
		return fmt.Errorf("failed to marshal user roles: %w", err)
	}

	query := `CALL CreateUser(?, ?, ?, ?, ?, ?, ?, ?)`

	_, err = r.db.Exec(query,
		u.ID,
		u.FirstName,
		u.MiddleName,
		u.LastName,
		u.NameSuffix,
		u.Email,
		u.PasswordHash,
		rolesJSON,
	)
	if err != nil {
		return fmt.Errorf("failed to execute CreateUser procedure: %w", err)
	}
	return nil
}

// UpdateStatus changes the user's active/inactive state.
func (r *UserRepository) UpdateStatus(user *models.User) error {
	query := `UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?`

	_, err := r.db.Exec(query, string(user.Status), user.ID)
	if err != nil {
		return fmt.Errorf("failed to update user status: %w", err)
	}
	return nil
}

// UpdateUserPassword calls the procedure for updating user's password.
func (r *UserRepository) UpdateUserPassword(user *models.User) error {
	query := `CALL UpdateUserPassword(?, ?)`

	_, err := r.db.Exec(query, user.ID, user.PasswordHash)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}
	return nil
}

func (r *UserRepository) UpdateFilteredRoles(adminID []byte, 
	userID []byte, roleIDs []int) error {
	forbiddenQuery, args, _ := sqlx.In(`
        SELECT r.role_name FROM user_roles ur
		JOIN roles r ON ur.role_id = r.id
		WHERE ur.user_id = ? 
		AND ur.role_id IN (?)
		AND NOT EXISTS (
			SELECT 1 FROM clients c
			JOIN admin_allowed_clients aac ON c.id = aac.client_id
			WHERE aac.user_id = ? AND r.role_name LIKE CONCAT(c.tag, ':%')
		)`, userID, roleIDs, adminID)

    var violations []string
    err := r.db.Select(&violations, forbiddenQuery, args...)
	if err != nil {
		return err
	}
	if len(violations) > 0 {
		return fmt.Errorf(
			"You are not permitted to modify these roles: %s", 
			violations,
		)
	}

	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	scopeQuery := `
		SELECT r.id
		FROM roles r
		JOIN client_allowed_roles cr ON r.id = cr.role_id
		JOIN clients c ON cr.client_id = c.id
		JOIN admin_allowed_clients aac ON c.id = aac.client_id
		WHERE aac.user_id = ?
		AND r.role_name LIKE CONCAT(c.tag, ':%')`

	deleteQuery := `
		DELETE FROM user_roles 
		WHERE user_id = ? 
		AND role_id IN (` + scopeQuery + `)
		AND role_id NOT IN (?)`

	deleteQuery, args, err = sqlx.In(deleteQuery, userID, adminID, roleIDs)
	if err != nil {
		return err
	}
	if _, err := tx.Exec(tx.Rebind(deleteQuery), args...); err != nil {
		return err
	}

	for _, rid := range roleIDs {
		ins := `
			INSERT INTO user_roles (user_id, role_id)
			SELECT ?, ? WHERE ? IN (` + scopeQuery + `)
			ON DUPLICATE KEY update role_id = role_id`
		_, err := tx.Exec(ins, userID, rid, rid, adminID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// UpdateUserRoles updates the roles of a specific user based on the role IDs
func (r *UserRepository) UpdateUserRoles(userID []byte, roleIDs []int) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// if some roles are deleted but not all
	if len(roleIDs) > 0 {
		deleteQuery, args, _ := sqlx.In(
			`DELETE FROM user_roles WHERE user_id = ? AND role_id NOT IN (?)`,
			userID,
			roleIDs,
		)
		if _, err := tx.Exec(tx.Rebind(deleteQuery), args...); err != nil {
			return fmt.Errorf("failed to delete user roles: %w", err)
		}
	} else {
		// If roleIDs is empty, remove all roles for the user
		deleteAll := "DELETE FROM user_roles WHERE user_id = ?"
		if _, err := tx.Exec(deleteAll, userID); err != nil {
			return fmt.Errorf("failed to delete all roles from user: %w", err)
		}
	}

	insertQuery := `
        INSERT INTO user_roles (user_id, role_id) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE role_id = role_id`

	for _, rid := range roleIDs {
		if _, err := tx.Exec(insertQuery, userID, rid); err != nil {
			return fmt.Errorf("upsert error: %w", err)
		}
	}

	return tx.Commit()
}

// GetRoles fetches the roles assigned to a user via the junction table.
func (r *UserRepository) GetRoles(userID []byte) ([]models.Role, error) {
	var roles []models.Role
	query := `
		SELECT r.id, r.role_name, r.description 
		FROM roles r
		JOIN user_roles ur ON r.id = ur.role_id
		WHERE ur.user_id = ? AND r.deleted_at IS NULL`

	err := r.db.Select(&roles, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user roles: %w", err)
	}
	return roles, nil
}

// SoftDelete marks the user as deleted for forensic record keeping.
func (r *UserRepository) SoftDelete(id []byte) error {
	query := `CALL ArchiveUser(?)`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *UserRepository) CountUsers() (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM users WHERE deleted_at IS NULL`
	err := r.db.Get(&count, query)
	return count, err
}

/**
 * CountBoundUsers returns the total number of distinct users,
 * explicitly including the admin themselves even without roles.
 */
func (r *UserRepository) CountBoundUsers(adminID []byte) (int, error) {
	var total int

	// UNION combines bound users and the admin, removing duplicates
	const countQuery = `
		SELECT COUNT(id) FROM (
			SELECT u.id 
			FROM users u
			JOIN user_roles ur ON u.id = ur.user_id
			JOIN client_allowed_roles car ON ur.role_id = car.role_id
			JOIN admin_allowed_clients aac 
				ON car.client_id = aac.client_id
			WHERE aac.user_id = ? AND u.deleted_at IS NULL
			UNION
			SELECT id FROM users 
			WHERE id = ? AND deleted_at IS NULL
		) AS bound_users
	`

	err := r.db.Get(&total, countQuery, adminID, adminID)
	if err != nil {
		return 0, fmt.Errorf(
			"[CountBoundUsers] {Database Query}: %w",
			err,
		)
	}

	return total, nil
}

func (r *UserRepository) mapSingleUser(rows []userRow) *models.User {
	// Initialize user using the first row's data
	user := &models.User{
		ID:           rows[0].ID,
		FirstName:    rows[0].FirstName,
		MiddleName:   rows[0].MiddleName,
		LastName:     rows[0].LastName,
		NameSuffix:   rows[0].NameSuffix,
		Email:        rows[0].Email,
		PasswordHash: rows[0].PasswordHash,
		Status:       rows[0].Status,
		CreatedAt:    rows[0].CreatedAt,
		UpdatedAt:    rows[0].UpdatedAt,
		Roles:        []models.Role{},
	}

	for _, row := range rows {
		if row.RID != nil {
			user.Roles = append(user.Roles, models.Role{
				ID:          *row.RID,
				RoleName:    *row.RName,
				Description: *row.RDesc,
			})
		}
	}

	return user
}

func (r *UserRepository) groupRows(rows []userRow, ids [][]byte) []models.User {
	userMap := make(map[string]*models.User)

	for _, row := range rows {
		idKey := string(row.ID)
		if _, exists := userMap[idKey]; !exists {
			userMap[idKey] = &models.User{
				ID: row.ID, FirstName: row.FirstName,
				MiddleName: row.MiddleName, LastName: row.LastName,
				NameSuffix: row.NameSuffix, Email: row.Email, Status: row.Status,
				CreatedAt: row.CreatedAt, UpdatedAt: row.UpdatedAt,
				Roles: []models.Role{},
			}
		}

		if row.RID != nil {
			userMap[idKey].Roles = append(userMap[idKey].Roles, models.Role{
				ID: *row.RID, RoleName: *row.RName, Description: *row.RDesc,
			})
		}
	}

	// Use the original IDs slice to maintain the SQL sort order
	result := make([]models.User, 0, len(ids))
	for _, id := range ids {
		if u, ok := userMap[string(id)]; ok {
			result = append(result, *u)
		}
	}
	return result
}

func (r *UserRepository) RemoveClientAdminBind(userID []byte) error {
	query := `
		DELETE FROM admin_allowed_clients
		WHERE client_id = ?
	`

	_, err := r.db.Exec(query, userID)
	return err
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}
