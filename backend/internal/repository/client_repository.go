package repository

import (
	"context"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type ClientRepository interface {
	GetByID(ctx context.Context, id []byte) (*models.Client, error)
	ListClients(ctx context.Context, limit,
		offset int, keyword string) ([]models.Client, error)
	ListBoundClients(ctx context.Context, limit, offset int,
		keyword string, userID []byte) ([]models.Client, error)
	CreateClient(ctx context.Context, client *models.Client,
		grants []string, userID []byte) error
	UpdateClient(ctx context.Context, c *models.Client,
		grants []string) error
	SoftDelete(ctx context.Context, id []byte) error
	GetGrantTypes(ctx context.Context, clientID []byte) ([]string, error)
	GetClientAllowedRoles(ctx context.Context,
		clientID []byte) ([]models.Role, error)
	ListClientBaseURLS(ctx context.Context) ([]string, error)
	CountClients(ctx context.Context, keyword string) (int, error)
	CountBoundClients(ctx context.Context, keyword string,
		userID []byte) (int, error)
	RotateSecret(ctx context.Context, id []byte, oldSecretHash,
		newSecretHash string) error
	ChangeSecret(ctx context.Context, id []byte,
		newSecretHash string) error
	DeleteAndInsertGrants(ctx context.Context, c *models.Client,
		grants []string) error
	AdminiClientBind(ctx context.Context, userID, clientID []byte) error
	BatchAdminClientBind(ctx context.Context, userID []byte,
		clientIDs [][]byte) error
	RemoveAdminClientBind(ctx context.Context, clientID []byte) error
	IsClientAllowed(ctx context.Context, userID, clientID []byte) (bool, error)
}

type clientRepository struct {
	db *sqlx.DB
}

// GetByID retrieves a specific client by its binary UUID.
func (r *clientRepository) GetByID(ctx context.Context,
	id []byte,
) (*models.Client, error) {
	var client models.Client
	query := `
		SELECT id, client_name, description,
		       image_location, base_url,
		       redirect_uri, logout_uri, updated_at
		FROM clients
		WHERE id = ? AND deleted_at IS NULL`

	err := r.db.GetContext(ctx, &client, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get client: %w", err)
	}

	grantQuery := `
		SELECT grant_type FROM client_grant_types WHERE client_id = ?
	`
	err = r.db.SelectContext(ctx, &client.Grants, grantQuery, id)
	if err != nil {
		return nil, err
	}

	roleQuery := `
		SELECT r.id, r.role_name, r.description
		FROM roles r
		JOIN users u ON u.role_id = r.id
		JOIN admin_allowed_clients aac ON aac.user_id = u.id
		WHERE aac.client_id = ? AND r.deleted_at IS NULL
		GROUP BY r.id
	`
	err = r.db.SelectContext(ctx, &client.AllowedRoles, roleQuery, id)
	if err != nil {
		return nil, err
	}

	return &client, nil
}

// ListClients returns a paginated list of non-deleted service providers.
func (r *clientRepository) ListClients(ctx context.Context, limit,
	offset int, keyword string,
) ([]models.Client, error) {
	var clients []models.Client
	searchKeyword := "%" + keyword + "%"
	query := `
		SELECT
			id, client_name,
			description, image_location,
			base_url, redirect_uri, logout_uri, created_at
		FROM clients
		WHERE deleted_at IS NULL AND client_name LIKE ?
		LIMIT ? OFFSET ?
	`

	err := r.db.SelectContext(ctx, &clients, query, searchKeyword, limit, offset)
	return clients, err
}

func (r *clientRepository) ListBoundClients(ctx context.Context,
	limit int, offset int, keyword string, userID []byte,
) ([]models.Client, error) {
	var clients []models.Client
	searchKeyword := "%" + keyword + "%"

	query := `
		SELECT
			c.id, c.client_name,
			c.description, c.image_location,
			c.base_url, c.redirect_uri, c.logout_uri, c.created_at
		FROM clients c
		JOIN admin_allowed_clients a ON c.id = a.client_id
		WHERE a.user_id = ?
			AND c.deleted_at IS NULL
			AND c.client_name LIKE ?
		LIMIT ? OFFSET ?
	`

	err := r.db.SelectContext(ctx, &clients, query, userID, searchKeyword,
		limit, offset)
	return clients, err
}

// CreateClient handles atomic insertion of client and grants.
func (r *clientRepository) CreateClient(ctx context.Context,
	client *models.Client, grants []string, userID []byte,
) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Insert Client
	q1 := `INSERT INTO clients (
			id, client_name, client_secret,
			base_url, redirect_uri, logout_uri,
			description, image_location
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	_, err = tx.ExecContext(ctx, q1, client.ID, client.ClientName,
		client.ClientSecret, client.BaseUrl, client.RedirectUri,
		client.LogoutUri, client.Description, client.ImageLocation,
	)
	if err != nil {
		return err
	}

	// 2. Insert Grant Types
	q2 := `
		INSERT INTO client_grant_types (client_id, grant_type)
		VALUES (?, ?)
	`
	for _, g := range grants {
		if _, err = tx.ExecContext(ctx, q2, client.ID, g); err != nil {
			return err
		}
	}

	// 3. Bind admin to client
	q3 := `
		INSERT INTO admin_allowed_clients (client_id, user_id)
		VALUES (?, ?)
	`
	_, err = tx.ExecContext(ctx, q3, client.ID, userID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// UpdateClient modifies safe fields only.
func (r *clientRepository) UpdateClient(ctx context.Context,
	c *models.Client, grants []string,
) error {
	query := `
		UPDATE clients
		SET
			client_name = ?,
			description = ?,
			image_location = IF(? = '', image_location, ?),
			base_url = ?,
			redirect_uri = ?,
			logout_uri = ?
		WHERE id = ?`

	_, err := r.db.ExecContext(ctx, query, c.ClientName, c.Description,
		c.ImageLocation, c.ImageLocation, c.BaseUrl, c.RedirectUri,
		c.LogoutUri, c.ID,
	)
	if err != nil {
		return err
	}

	return r.DeleteAndInsertGrants(ctx, c, grants)
}

// SoftDelete marks a client as deleted.
func (r *clientRepository) SoftDelete(ctx context.Context, id []byte) error {
	query := `UPDATE clients SET deleted_at = NOW() WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *clientRepository) GetGrantTypes(ctx context.Context,
	clientID []byte,
) ([]string, error) {
	var grants []string
	query := `SELECT grant_type FROM client_grant_types WHERE client_id = ?`
	err := r.db.SelectContext(ctx, &grants, query, clientID)
	return grants, err
}

// GetClientAllowedRoles returns the distinct set of roles assigned
// to users who are bound to this client.
func (r *clientRepository) GetClientAllowedRoles(ctx context.Context,
	clientID []byte,
) ([]models.Role, error) {
	var roles []models.Role
	query := `
		SELECT DISTINCT r.id, r.role_name, r.description
		FROM roles r
		JOIN users u ON u.role_id = r.id
		JOIN admin_allowed_clients aac ON aac.user_id = u.id
		WHERE aac.client_id = ? AND r.deleted_at IS NULL
	`
	err := r.db.SelectContext(ctx, &roles, query, clientID)
	return roles, err
}

func (r *clientRepository) ListClientBaseURLS(ctx context.Context,
) ([]string, error) {
	var baseURLS []string
	query := `SELECT base_url FROM clients WHERE deleted_at IS NULL`
	err := r.db.SelectContext(ctx, &baseURLS, query)
	if err != nil {
		return nil, err
	}
	return baseURLS, nil
}

func (r *clientRepository) CountClients(ctx context.Context,
	keyword string,
) (int, error) {
	var count int
	searchKeyword := "%" + keyword + "%"

	query := `
		SELECT COUNT(*) FROM clients 
		WHERE deleted_at IS NULL
		AND client_name LIKE ?
	`
	err := r.db.GetContext(ctx, &count, query, searchKeyword)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (r *clientRepository) CountBoundClients(ctx context.Context,
	keyword string, userID []byte,
) (int, error) {
	var count int
	searchKeyword := "%" + keyword + "%"

	query := `
		SELECT COUNT(*)
		FROM clients c
		JOIN admin_allowed_clients a ON c.id = a.client_id
		WHERE a.user_id = ? 
			AND c.deleted_at IS NULL 
			AND c.client_name LIKE ?
	`

	err := r.db.GetContext(ctx, &count, query, userID, searchKeyword)

	return count, err
}

func (r *clientRepository) RotateSecret(ctx context.Context,
	id []byte, oldSecretHash, newSecretHash string,
) error {
	query := `
		UPDATE clients
		SET client_secret = ?, old_secret = ?
		WHERE id = ?
	`

	_, err := r.db.ExecContext(ctx, query, newSecretHash, oldSecretHash, id)
	if err != nil {
		return err
	}
	return nil
}

func (r *clientRepository) ChangeSecret(ctx context.Context,
	id []byte, newSecretHash string,
) error {
	query := `
		UPDATE clients
		SET client_secret = ?
		WHERE id = ?
	`

	_, err := r.db.ExecContext(ctx, query, newSecretHash, id)
	if err != nil {
		return err
	}
	return nil
}

func (r *clientRepository) DeleteAndInsertGrants(ctx context.Context,
	c *models.Client, grants []string,
) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	delQuery := `DELETE FROM client_grant_types WHERE client_id = ?`
	if _, err = tx.ExecContext(ctx, delQuery, c.ID); err != nil {
		return err
	}

	insQuery := `
		INSERT INTO client_grant_types (client_id, grant_type)
		VALUES (?, ?)
	`
	for _, grant := range grants {
		if _, err = tx.ExecContext(ctx, insQuery, c.ID, grant); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *clientRepository) AdminiClientBind(ctx context.Context,
	userID, clientID []byte,
) error {
	query := `
		INSERT INTO admin_allowed_clients (user_id, client_id)
		VALUES (?, ?)
	`

	_, err := r.db.ExecContext(ctx, query, userID, clientID)
	return err
}

func (r *clientRepository) BatchAdminClientBind(ctx context.Context,
	userID []byte, clientIDs [][]byte,
) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO admin_allowed_clients (user_id, client_id) 
		VALUES (?, ?)
	`
	for _, clientID := range clientIDs {
		_, err = tx.ExecContext(ctx, query, userID, clientID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *clientRepository) RemoveAdminClientBind(ctx context.Context,
	clientID []byte,
) error {
	query := `
		DELETE FROM admin_allowed_clients
		WHERE client_id = ?
	`

	_, err := r.db.ExecContext(ctx, query, clientID)
	return err
}

func (r *clientRepository) IsClientAllowed(ctx context.Context,
	userID, clientID []byte,
) (bool, error) {
	var allowed bool
	query := `
		SELECT EXISTS(
			SELECT 1 FROM admin_allowed_clients 
			WHERE user_id = ? AND client_id = ?
		)`
	err := r.db.GetContext(ctx, &allowed, query, userID, clientID)
	return allowed, err
}

func NewClientRepository(db *sqlx.DB) ClientRepository {
	return &clientRepository{db: db}
}
