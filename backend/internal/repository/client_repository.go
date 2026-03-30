package repository

import (
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type ClientRepository struct {
	db *sqlx.DB
}

// GetByID retrieves a specific client by its binary UUID.
// @Summary Get Client by ID
// @ID get-client-by-id
// @Accept json
// @Produce json
// @Param id query []byte true "Client Binary ID"
// @Success 200 {object} models.Client
func (r *ClientRepository) GetByID(id []byte) (*models.Client, error) {
	var client models.Client
	query := `
		SELECT id, client_name, description,
		       image_location, base_url,
		       redirect_uri, logout_uri, updated_at
		FROM clients
		WHERE id = ? AND deleted_at IS NULL`

	err := r.db.Get(&client, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get client: %w", err)
	}

	grantQuery := `
		SELECT grant_type FROM client_grant_types WHERE client_id = ?
	`
	err = r.db.Select(&client.Grants, grantQuery, id)
	if err != nil {
		return nil, err
	}

	roleQuery := `
		SELECT r.id, r.role_name, r.description
		FROM roles r
		JOIN user_roles ur ON ur.role_id = r.id
		JOIN admin_allowed_clients aac ON aac.user_id = ur.user_id
		WHERE aac.client_id = ? AND r.deleted_at IS NULL
		GROUP BY r.id
	`
	err = r.db.Select(&client.AllowedRoles, roleQuery, id)
	if err != nil {
		return nil, err
	}

	return &client, nil
}

// ListClients returns a paginated list of non-deleted service providers.
// @Summary List Clients
// @ID list-clients
// @Param limit query int true "Limit"
// @Param offset query int true "Offset"
// @Success 200 {array} models.Client
func (r *ClientRepository) ListClients(limit,
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

	err := r.db.Select(&clients, query, searchKeyword, limit, offset)
	return clients, err
}

func (r *ClientRepository) ListBoundClients(
	limit int,
	offset int,
	keyword string,
	userID []byte,
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

	err := r.db.Select(
		&clients,
		query,
		userID,
		searchKeyword,
		limit,
		offset,
	)
	return clients, err
}

// CreateClient handles atomic insertion of client and grants.
// Roles are scoped to a client implicitly via prefixed role names.
// @Summary Create Client
// @ID create-client
func (r *ClientRepository) CreateClient(
	client *models.Client,
	grants []string,
	userID []byte,
) error {
	tx, err := r.db.Beginx()
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
	_, err = tx.Exec(
		q1,
		client.ID, client.ClientName,
		client.ClientSecret, client.BaseUrl,
		client.RedirectUri, client.LogoutUri,
		client.Description, client.ImageLocation,
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
		if _, err = tx.Exec(q2, client.ID, g); err != nil {
			return err
		}
	}

	// 3. Bind admin to client
	q3 := `
		INSERT INTO admin_allowed_clients (client_id, user_id)
		VALUES (?, ?)
	`
	_, err = tx.Exec(q3, client.ID, userID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// UpdateClient modifies safe fields only. Secret is locked.
// @Summary Update Client
// @ID update-client
func (r *ClientRepository) UpdateClient(
	c *models.Client,
	grants []string,
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

	_, err := r.db.Exec(
		query,
		c.ClientName,
		c.Description,
		c.ImageLocation,
		c.ImageLocation,
		c.BaseUrl,
		c.RedirectUri,
		c.LogoutUri,
		c.ID,
	)
	if err != nil {
		return err
	}

	return r.DeleteAndInsertGrants(c, grants)
}

// SoftDelete marks a client as deleted withkey stringout removing the audit trail.
// @Summary Soft Delete Client
// @ID delete-client
func (r *ClientRepository) SoftDelete(id []byte) error {
	query := `UPDATE clients SET deleted_at = NOW() WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *ClientRepository) GetGrantTypes(clientID []byte) ([]string, error) {
	var grants []string
	query := `SELECT grant_type FROM client_grant_types WHERE client_id = ?`
	err := r.db.Select(&grants, query, clientID)
	return grants, err
}

// GetClientAllowedRoles returns the distinct set of roles assigned
// to users who are bound to this client.
func (r *ClientRepository) GetClientAllowedRoles(
	clientID []byte,
) ([]models.Role, error) {
	var roles []models.Role
	query := `
		SELECT DISTINCT r.id, r.role_name, r.description
		FROM roles r
		JOIN user_roles ur ON ur.role_id = r.id
		JOIN admin_allowed_clients aac ON aac.user_id = ur.user_id
		WHERE aac.client_id = ? AND r.deleted_at IS NULL
	`
	err := r.db.Select(&roles, query, clientID)
	return roles, err
}

func (r *ClientRepository) ListClientBaseURLS() ([]string, error) {
	var baseURLS []string
	query := `SELECT base_url FROM clients WHERE deleted_at IS NULL`
	err := r.db.Select(&baseURLS, query)
	if err != nil {
		return nil, err
	}
	return baseURLS, nil
}

func (r *ClientRepository) CountClients(keyword string) (int, error) {
	var count int
	searchKeyword := "%" + keyword + "%"

	query := `
		SELECT COUNT(*) FROM clients 
		WHERE deleted_at IS NULL
		AND client_name LIKE ?
	`
	err := r.db.Get(&count, query, searchKeyword)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (r *ClientRepository) CountBoundClients(keyword string,
	userID []byte,
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

	err := r.db.Get(&count, query, userID, searchKeyword)

	return count, err
}

func (r *ClientRepository) RotateSecret(id []byte, oldSecretHash string,
	newSecretHash string,
) error {
	query := `
		UPDATE clients
		SET client_secret = ?, old_secret = ?
		WHERE id = ?
	`

	_, err := r.db.Exec(query, newSecretHash, oldSecretHash, id)
	if err != nil {
		return err
	}
	return nil
}

func (r *ClientRepository) ChangeSecret(id []byte, newSecretHash string,
) error {
	query := `
		UPDATE clients
		SET client_secret = ?
		WHERE id = ?
	`

	_, err := r.db.Exec(query, newSecretHash, id)
	if err != nil {
		return err
	}
	return nil
}

func (r *ClientRepository) DeleteAndInsertGrants(
	c *models.Client,
	grants []string,
) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	delQuery := `DELETE FROM client_grant_types WHERE client_id = ?`
	if _, err = tx.Exec(delQuery, c.ID); err != nil {
		return err
	}

	insQuery := `
		INSERT INTO client_grant_types (client_id, grant_type)
		VALUES (?, ?)
	`
	for _, grant := range grants {
		if _, err = tx.Exec(insQuery, c.ID, grant); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *ClientRepository) AdminiClientBind(userID []byte,
	clientID []byte,
) error {
	query := `
		INSERT INTO admin_alllowed_lients (user_id, client_id)
		VALUES (?, ?)
	`

	_, err := r.db.Exec(query, userID, clientID)
	return err
}

func (r *ClientRepository) RemoveAdminClientBind(clientID []byte) error {
	query := `
		DELETE FROM admin_allowed_clients
		WHERE client_id = ?
	`

	_, err := r.db.Exec(query, clientID)
	return err
}

func NewClientRepository(db *sqlx.DB) *ClientRepository {
	return &ClientRepository{db: db}
}
