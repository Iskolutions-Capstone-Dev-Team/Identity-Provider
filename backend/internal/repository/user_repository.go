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
	GetUserById(ctx context.Context, id []byte) (*models.User, error)
	CreateUser(ctx context.Context, u *models.User) error
	UpdateStatus(ctx context.Context, user *models.User) error
	UpdateUserPassword(ctx context.Context, user *models.User) error
	UpdateUserRole(ctx context.Context, userID []byte,
		roleID sql.NullInt64) error
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
			JOIN client_allowed_roles car ON u.role_id = car.role_id
			JOIN admin_allowed_clients aac 
				ON car.client_id = aac.client_id
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
               u.created_at, u.updated_at, r.id AS role_id, 
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

	return &user, nil
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

	return &user, nil
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
			JOIN client_allowed_roles car ON u.role_id = car.role_id
			JOIN admin_allowed_clients aac 
				ON car.client_id = aac.client_id
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
