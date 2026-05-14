package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type UserRepository interface {
	GetUserList(ctx context.Context, limit, offset int) ([]models.User, error)
	GetBoundUserList(ctx context.Context, limit, offset int,
		adminID []byte) ([]models.User, error)
	GetAdminUserList(ctx context.Context, limit,
		offset int) ([]models.User, error)
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	GetUserByEmailIncludeDeleted(ctx context.Context,
		email string) (*models.User, error)
	GetUserById(ctx context.Context, id []byte) (*models.User, error)
	CreateUser(ctx context.Context, u *models.User) error
	RestoreUser(ctx context.Context, id []byte) error
	ClearUserRelations(ctx context.Context, id []byte) error
	UpdateStatus(ctx context.Context, user *models.User) error
	UpdateUserPassword(ctx context.Context, user *models.User) error
	UpdateUserRole(ctx context.Context, userID []byte,
		roleID sql.NullInt64) error
	UpdateUserName(ctx context.Context, user *models.User) error
	SoftDelete(ctx context.Context, id []byte) error
	CountUsers(ctx context.Context) (int, error)
	CountAdminUsers(ctx context.Context) (int, error)
	CountBoundUsers(ctx context.Context, adminID []byte) (int, error)
	RemoveClientAdminBind(ctx context.Context, userID []byte) error
}

type userRepository struct {
	db *sqlx.DB
}

type userRow struct {
	models.User
	RID   sql.NullInt64  `db:"role_id"`
	RName sql.NullString `db:"role_name"`
	RDesc sql.NullString `db:"role_description"`
}

// GetUserList retrieves a paginated list of non-deleted users.
func (r *userRepository) GetUserList(ctx context.Context,
	limit, offset int,
) ([]models.User, error) {
	var ids [][]byte
	idQuery := `SELECT id FROM users WHERE deleted_at IS NULL LIMIT ? OFFSET ?`

	err := r.db.SelectContext(ctx, &ids, idQuery, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("[GetUserList] ID Fetch: %w", err)
	}

	if len(ids) == 0 {
		return []models.User{}, nil
	}

	sql := `
        SELECT u.id, u.first_name, u.middle_name, u.last_name, 
               u.name_suffix, u.email, u.status, u.created_at, 
               u.updated_at, r.id AS role_id, r.role_name AS role_name, 
               r.description AS role_description
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id IN (?) AND u.deleted_at IS NULL
        ORDER BY u.created_at DESC`

	fullQuery, args, err := sqlx.In(sql, ids)
	if err != nil {
		return nil, fmt.Errorf("[GetUserList] In-Query expansion: %w", err)
	}

	fullQuery = r.db.Rebind(fullQuery)

	var rows []userRow
	err = r.db.SelectContext(ctx, &rows, fullQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("[GetUserList] Database Query: %w", err)
	}

	result := make([]models.User, 0, len(rows))
	for _, row := range rows {
		user := row.User
		if row.RID.Valid {
			user.RoleID = row.RID
			user.Role = models.Role{
				ID:          int(row.RID.Int64),
				RoleName:    row.RName.String,
				Description: row.RDesc.String,
			}
		}
		result = append(result, user)
	}

	if err := r.populateClients(ctx, result); err != nil {
		return nil, fmt.Errorf("[GetUserList] Prep: %w", err)
	}

	return result, nil
}

// GetAdminUserList retrieves users that have an assigned role.
func (r *userRepository) GetAdminUserList(ctx context.Context,
	limit, offset int,
) ([]models.User, error) {
	var ids [][]byte
	idQuery := `SELECT id FROM users 
                WHERE deleted_at IS NULL AND role_id IS NOT NULL 
                LIMIT ? OFFSET ?`

	err := r.db.SelectContext(ctx, &ids, idQuery, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("[GetAdminUserList] ID Fetch: %w", err)
	}

	if len(ids) == 0 {
		return []models.User{}, nil
	}

	const sql = `
        SELECT u.id, u.first_name, u.middle_name, u.last_name, 
               u.name_suffix, u.email, u.status, u.created_at, 
               u.updated_at, r.id AS role_id, r.role_name AS role_name, 
               r.description AS role_description
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id IN (?) AND u.deleted_at IS NULL
        ORDER BY u.created_at DESC`

	fullQuery, args, err := sqlx.In(sql, ids)
	if err != nil {
		return nil, fmt.Errorf("[GetAdminUserList] expansion: %w", err)
	}

	fullQuery = r.db.Rebind(fullQuery)

	var rows []userRow
	err = r.db.SelectContext(ctx, &rows, fullQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("[GetAdminUserList] Query: %w", err)
	}

	result := make([]models.User, 0, len(rows))
	for _, row := range rows {
		user := row.User
		if row.RID.Valid {
			user.RoleID = row.RID
			user.Role = models.Role{
				ID:          int(row.RID.Int64),
				RoleName:    row.RName.String,
				Description: row.RDesc.String,
			}
		}
		result = append(result, user)
	}

	if err := r.populateClients(ctx, result); err != nil {
		return nil, fmt.Errorf("[GetAdminUserList] Prep: %w", err)
	}

	return result, nil
}

// GetBoundUserList retrieves a paginated list of users for an admin.
func (r *userRepository) GetBoundUserList(ctx context.Context,
	limit int, offset int, adminID []byte,
) ([]models.User, error) {
	var ids [][]byte

	const idQuery = `
		SELECT id FROM (
			SELECT u.id 
			FROM users u
			JOIN client_allowed_users cau ON u.id = cau.user_id
			JOIN admin_allowed_clients aac 
				ON cau.client_id = aac.client_id
			WHERE aac.user_id = ? AND u.deleted_at IS NULL
			UNION
			SELECT id FROM users 
			WHERE id = ? AND deleted_at IS NULL
		) AS bound_users
		LIMIT ? OFFSET ?
	`

	err := r.db.SelectContext(ctx, &ids, idQuery, adminID, adminID,
		limit, offset)
	if err != nil {
		return nil, fmt.Errorf("[GetBoundUserList] {ID Fetch}: %w", err)
	}

	if len(ids) == 0 {
		return []models.User{}, nil
	}

	const baseQuery = `
		SELECT u.id, u.first_name, u.middle_name, 
		       u.last_name, u.name_suffix, u.email, u.status, u.created_at, 
		       u.updated_at, r.id AS role_id, 
		       r.role_name AS role_name, 
		       r.description AS role_description
		FROM users u
		LEFT JOIN roles r ON u.role_id = r.id
		WHERE u.id IN (?) AND u.deleted_at IS NULL
		ORDER BY u.created_at DESC
	`

	fullQuery, args, err := sqlx.In(baseQuery, ids)
	if err != nil {
		return nil, fmt.Errorf(
			"[GetBoundUserList] {Query Expansion}: %w",
			err,
		)
	}

	fullQuery = r.db.Rebind(fullQuery)

	var rows []userRow
	err = r.db.SelectContext(ctx, &rows, fullQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("[GetBoundUserList] {Database Join}: %w", err)
	}

	result := make([]models.User, 0, len(rows))
	for _, row := range rows {
		user := row.User
		if row.RID.Valid {
			user.RoleID = row.RID
			user.Role = models.Role{
				ID:          int(row.RID.Int64),
				RoleName:    row.RName.String,
				Description: row.RDesc.String,
			}
		}
		result = append(result, user)
	}

	if err := r.populateClients(ctx, result); err != nil {
		return nil, fmt.Errorf("[GetBoundList] Prep: %w", err)
	}

	return result, nil
}

// GetUserByEmail finds a user by email, including the hash and roles.
func (r *userRepository) GetUserByEmail(ctx context.Context,
	email string,
) (*models.User, error) {
	var rows []userRow
	query := `
        SELECT u.id, u.first_name, u.middle_name, u.last_name,
               u.name_suffix, u.email, u.password_hash, u.status, 
               u.created_at, u.updated_at, u.deleted_at, r.id AS role_id, 
               r.role_name AS role_name, r.description AS role_description
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = ? AND u.deleted_at IS NULL`

	err := r.db.SelectContext(ctx, &rows, query, email)
	if err != nil {
		return nil, fmt.Errorf("[GetUserByEmail] Database Query: %w", err)
	}

	if len(rows) == 0 {
		return nil, nil
	}

	user := rows[0].User
	if rows[0].RID.Valid {
		user.RoleID = rows[0].RID
		user.Role = models.Role{
			ID:          int(rows[0].RID.Int64),
			RoleName:    rows[0].RName.String,
			Description: rows[0].RDesc.String,
		}
	}

	result := []models.User{user}
	if err := r.populateClients(ctx, result); err != nil {
		return nil, fmt.Errorf("[GetUserByEmail] Prep: %w", err)
	}

	return &result[0], nil
}

func (r *userRepository) GetUserByEmailIncludeDeleted(ctx context.Context,
	email string,
) (*models.User, error) {
	var rows []userRow
	query := `
        SELECT u.id, u.first_name, u.middle_name, u.last_name,
               u.name_suffix, u.email, u.password_hash, u.status, 
               u.created_at, u.updated_at, u.deleted_at, r.id AS role_id, 
               r.role_name AS role_name, r.description AS role_description
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = ?`

	err := r.db.SelectContext(ctx, &rows, query, email)
	if err != nil {
		return nil, fmt.Errorf("[GetUserByEmailAll] Database Query: %w", err)
	}

	if len(rows) == 0 {
		return nil, nil
	}

	user := rows[0].User
	if rows[0].RID.Valid {
		user.RoleID = rows[0].RID
		user.Role = models.Role{
			ID:          int(rows[0].RID.Int64),
			RoleName:    rows[0].RName.String,
			Description: rows[0].RDesc.String,
		}
	}

	result := []models.User{user}
	if err := r.populateClients(ctx, result); err != nil {
		return nil, fmt.Errorf("[GetUserByEmailAll] Prep: %w", err)
	}

	return &result[0], nil
}

func (r *userRepository) RestoreUser(ctx context.Context, id []byte) error {
	query := `UPDATE users SET deleted_at = NULL, status = 'active', 
	          updated_at = NOW() WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *userRepository) ClearUserRelations(ctx context.Context, id []byte) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	tables := []string{
		"client_allowed_users",
		"admin_allowed_clients",
		"otps",
		"refresh_tokens",
		"authorization_codes",
		"idp_sessions",
	}

	for _, table := range tables {
		query := fmt.Sprintf("DELETE FROM %s WHERE user_id = ?", table)
		if _, err := tx.ExecContext(ctx, query, id); err != nil {
			return fmt.Errorf("clearing %s: %w", table, err)
		}
	}

	// Also clear role in the users table
	if _, err := tx.ExecContext(ctx,
		"UPDATE users SET role_id = NULL WHERE id = ?", id); err != nil {
		return fmt.Errorf("clearing user role: %w", err)
	}

	return tx.Commit()
}

// GetUserById retrieves a specific user by binary UUID including roles.
func (r *userRepository) GetUserById(ctx context.Context,
	id []byte,
) (*models.User, error) {
	var rows []userRow
	query := `
        SELECT u.id, u.first_name, u.middle_name, u.last_name,
               u.name_suffix, u.email, u.status, u.created_at, 
               u.updated_at, r.id AS role_id, r.role_name AS role_name, 
               r.description AS role_description
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ? AND u.deleted_at IS NULL`

	err := r.db.SelectContext(ctx, &rows, query, id)
	if err != nil {
		return nil, fmt.Errorf("[GetUserById] Database Query: %w", err)
	}

	if len(rows) == 0 {
		return nil, nil
	}

	user := rows[0].User
	if rows[0].RID.Valid {
		user.RoleID = rows[0].RID
		user.Role = models.Role{
			ID:          int(rows[0].RID.Int64),
			RoleName:    rows[0].RName.String,
			Description: rows[0].RDesc.String,
		}
	}

	result := []models.User{user}
	if err := r.populateClients(ctx, result); err != nil {
		return nil, fmt.Errorf("[GetUserById] Prep: %w", err)
	}

	return &result[0], nil
}

// CreateUser executes a stored procedure to handle User creation.
func (r *userRepository) CreateUser(ctx context.Context, u *models.User) error {
	query := `CALL CreateUser(?, ?, ?, ?, ?, ?, ?, ?)`

	_, err := r.db.ExecContext(ctx, query, u.ID, u.FirstName, u.MiddleName,
		u.LastName, u.NameSuffix, u.Email, u.PasswordHash, u.RoleID)
	if err != nil {
		return fmt.Errorf("failed to execute CreateUser procedure: %w", err)
	}
	return nil
}

// UpdateStatus changes the user's active/inactive state.
func (r *userRepository) UpdateStatus(ctx context.Context,
	user *models.User,
) error {
	query := `UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?`

	_, err := r.db.ExecContext(ctx, query, string(user.Status), user.ID)
	if err != nil {
		return fmt.Errorf("failed to update user status: %w", err)
	}
	return nil
}

// UpdateUserPassword calls the procedure for updating user's password.
func (r *userRepository) UpdateUserPassword(ctx context.Context,
	user *models.User,
) error {
	query := `CALL UpdateUserPassword(?, ?)`

	_, err := r.db.ExecContext(ctx, query, user.ID, user.PasswordHash)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}
	return nil
}

// UpdateUserRole updates the role of a specific user.
func (r *userRepository) UpdateUserRole(ctx context.Context,
	userID []byte, roleID sql.NullInt64,
) error {
	query := `UPDATE users SET role_id = ?, updated_at = NOW() WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, roleID, userID)
	if err != nil {
		return fmt.Errorf("failed to update user role: %w", err)
	}
	return nil
}

// UpdateUserName updates the name fields of a specific user.
func (r *userRepository) UpdateUserName(ctx context.Context,
	user *models.User,
) error {
	query := `UPDATE users SET first_name = ?, middle_name = ?, 
	          last_name = ?, name_suffix = ?, updated_at = NOW() 
	          WHERE id = ?`

	_, err := r.db.ExecContext(ctx, query, user.FirstName, user.MiddleName,
		user.LastName, user.NameSuffix, user.ID)
	if err != nil {
		return fmt.Errorf("failed to update user name: %w", err)
	}
	return nil
}

// SoftDelete marks the user as deleted.
func (r *userRepository) SoftDelete(ctx context.Context, id []byte) error {
	query := `CALL ArchiveUser(?)`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *userRepository) CountUsers(ctx context.Context) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM users WHERE deleted_at IS NULL`
	err := r.db.GetContext(ctx, &count, query)
	return count, err
}

func (r *userRepository) CountAdminUsers(ctx context.Context) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM users 
              WHERE deleted_at IS NULL AND role_id IS NOT NULL`
	err := r.db.GetContext(ctx, &count, query)
	return count, err
}

// CountBoundUsers returns the total number of distinct users for an admin.
func (r *userRepository) CountBoundUsers(ctx context.Context,
	adminID []byte,
) (int, error) {
	var total int

	const countQuery = `
		SELECT COUNT(id) FROM (
			SELECT u.id 
			FROM users u
			JOIN client_allowed_users cau ON u.id = cau.user_id
			JOIN admin_allowed_clients aac 
				ON cau.client_id = aac.client_id
			WHERE aac.user_id = ? AND u.deleted_at IS NULL
			UNION
			SELECT id FROM users 
			WHERE id = ? AND deleted_at IS NULL
		) AS bound_users
	`

	err := r.db.GetContext(ctx, &total, countQuery, adminID, adminID)
	if err != nil {
		return 0, fmt.Errorf(
			"[CountBoundUsers] {Database Query}: %w",
			err,
		)
	}

	return total, nil
}

func (r *userRepository) RemoveClientAdminBind(ctx context.Context,
	userID []byte,
) error {
	query := `
		DELETE FROM admin_allowed_clients
		WHERE user_id = ?
	`

	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}

func NewUserRepository(db *sqlx.DB) UserRepository {
	return &userRepository{db: db}
}

type clientAccessRow struct {
	UserID     []byte `db:"user_id"`
	ClientID   []byte `db:"client_id"`
	ClientName string `db:"client_name"`
	Source     string `db:"source"`
}

/**
 * populateClients fetches and assigns allowed clients to a list of users.
 */
func (r *userRepository) populateClients(ctx context.Context,
	users []models.User,
) error {
	if len(users) == 0 {
		return nil
	}

	userIDs := make([][]byte, 0, len(users))
	for _, u := range users {
		userIDs = append(userIDs, u.ID)
	}

	const query = `
		SELECT cau.user_id, c.id AS client_id, c.client_name, cau.source
		FROM (
			SELECT user_id, client_id, 'allowed' AS source 
			FROM client_allowed_users
			UNION ALL
			SELECT user_id, client_id, 'managed' AS source 
			FROM admin_allowed_clients
		) cau
		JOIN clients c ON cau.client_id = c.id
		WHERE cau.user_id IN (?)
	`

	fullQuery, args, err := sqlx.In(query, userIDs)
	if err != nil {
		return fmt.Errorf("In-Query Expansion: %w", err)
	}

	fullQuery = r.db.Rebind(fullQuery)

	var rows []clientAccessRow
	err = r.db.SelectContext(ctx, &rows, fullQuery, args...)
	if err != nil {
		return fmt.Errorf("database map fetch: %w", err)
	}

	allowedMap := make(map[string]map[string]models.Client)
	managedMap := make(map[string][]models.Client)
	for _, row := range rows {
		userKey := string(row.UserID)
		clientKey := string(row.ClientID)
		client := models.Client{
			ID:         row.ClientID,
			ClientName: row.ClientName,
		}

		if allowedMap[userKey] == nil {
			allowedMap[userKey] = make(map[string]models.Client)
		}
		allowedMap[userKey][clientKey] = client

		if row.Source == "managed" {
			managedMap[userKey] = append(managedMap[userKey], client)
		}
	}

	for i := range users {
		clients := make([]models.Client, 0,
			len(allowedMap[string(users[i].ID)]))
		for _, c := range allowedMap[string(users[i].ID)] {
			clients = append(clients, c)
		}
		users[i].AllowedClients = clients
		users[i].ManagedClients = managedMap[string(users[i].ID)]
	}

	return nil
}
