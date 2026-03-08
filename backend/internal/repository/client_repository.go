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
        SELECT id, client_name, tag, description, 
               image_location, base_url, redirect_uri, logout_uri, updated_at
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
		SELECT r.id, r.role_name
		FROM roles r
		JOIN client_allowed_roles c ON c.role_id = r.id
		WHERE c.client_id = ?
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
			id, client_name, tag, 
			description, image_location, 
			base_url, redirect_uri, logout_uri, created_at
        FROM clients 
        WHERE deleted_at IS NULL AND client_name LIKE ?
        LIMIT ? OFFSET ?
	`

	err := r.db.Select(&clients, query, searchKeyword, limit, offset)
	return clients, err
}

// CreateClient handles atomic insertion of client, grants, and prefixed roles.
// @Summary Create Client
// @ID create-client
func (r *ClientRepository) CreateClient(
	client *models.Client,
	grants []string,
	roleIDs []int,
) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Insert Client
	q1 := `INSERT INTO clients (id, client_name, tag, client_secret, 
               base_url, redirect_uri, logout_uri, description, image_location) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err = tx.Exec(q1, client.ID, client.ClientName, client.Tag,
		client.ClientSecret, client.BaseUrl, client.RedirectUri,
		client.LogoutUri, client.Description, client.ImageLocation)
	if err != nil {
		return err
	}

	// 2. Insert Grant Types
	q2 := `INSERT INTO client_grant_types (client_id, grant_type) VALUES (?, ?)`
	for _, g := range grants {
		if _, err = tx.Exec(q2, client.ID, g); err != nil {
			return err
		}
	}

	// 3. Insert Client-allowed Roles
	q3 := `
		INSERT INTO client_allowed_roles (client_id, role_id) 
		VALUES (?, ?)
	`
	for _, roleID := range roleIDs {
		if _, err = tx.Exec(q3, client.ID, roleID); err != nil {
			return err
		}
	}

	return tx.Commit()
}

// UpdateClient modifies safe fields only. tag and Secret are locked.
// @Summary Update Client
// @ID update-client
func (r *ClientRepository) UpdateClient(c *models.Client,
	grants []string, roleIDs []int,
) error {
	query := `
        UPDATE clients 
        SET client_name = ?, description = ?, 
            image_location = IF(? = '', image_location, ?), 
            base_url = ?, redirect_uri = ?, logout_uri = ?
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

	err = r.DeleteAndInsertGrants(c, grants)
	if err != nil {
		return err
	}

	err = r.UpdateAllowedRoles(c, roleIDs)
	if err != nil {
		return err
	}

	return nil
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

func (r *ClientRepository) GetClientRoles(abbr string) ([]string, error) {
	var roles []string
	// Using LIKE to find all roles prefixed with the tag
	query := `SELECT role_name FROM roles WHERE role_name LIKE ?`
	err := r.db.Select(&roles, query, abbr+":%")
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

func (r *ClientRepository) CountClients() (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM clients WHERE deleted_at IS NULL`
	err := r.db.Get(&count, query)
	if err != nil {
		return 0, err
	}
	return count, nil
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

func (r *ClientRepository) RetrieveClientTagInformation(limit int,
	offset int, keyword string,
) ([]models.Client, error) {
	var clients []models.Client
	searchTerm := "%" + keyword + "%"

	query := `
		SELECT id, tag, image_location
		FROM clients
		WHERE deleted_at IS NULL AND tag LIKE ?
		LIMIT ? OFFSET ?
	`

	err := r.db.Select(&clients, query, searchTerm, limit, offset)
	if err != nil {
		return nil, err
	}
	return clients, nil
}

func (r *ClientRepository) DeleteAndInsertGrants(c *models.Client,
	grants []string,
) error {
	// Delete all and insert new grants
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	deleteQuery := `DELETE from client_grant_types WHERE client_id = ?`
	_, err = tx.Exec(deleteQuery, c.ID)
	if err != nil {
		return err
	}

	insertQuery := `
		INSERT INTO client_grant_types (client_id, grant_type)
		VALUES (?, ?)
	`
	for _, grant := range grants {
		_, err = tx.Exec(insertQuery, c.ID, grant)
		if err != nil {
			return err
		}
	}

	if err = tx.Commit(); err != nil {
		return err
	}
	return nil
}

func (r *ClientRepository) UpdateAllowedRoles(client *models.Client,
	roleIDs []int,
) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	deleteQuery := `
		DELETE FROM client_allowed_roles 
		WHERE client_id = ? AND role_id NOT IN (?)
	`
	if len(roleIDs) > 0 {
		deleteQuery, args, _ := sqlx.In(
			deleteQuery,
			client.ID,
			roleIDs,
		)
		if _, err := tx.Exec(tx.Rebind(deleteQuery), args...); err != nil {
			return fmt.Errorf("failed to delete client allowed roles: %w", err)
		}
	} else {
		deleteAll := "DELETE FROM client_allowed_roles WHERE client_id = ?"
		if _, err := tx.Exec(deleteAll, client.ID); err != nil {
			return fmt.Errorf("failed to delete all roles from user: %w", err)
		}
	}

	insertQuery := `
        INSERT INTO client_allowed_roles (client_id, role_id) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE role_id = role_id`

	for _, rid := range roleIDs {
		if _, err := tx.Exec(insertQuery, client.ID, rid); err != nil {
			return fmt.Errorf("upsert error: %w", err)
		}
	}

	return tx.Commit()
}

func NewClientRepository(db *sqlx.DB) *ClientRepository {
	return &ClientRepository{db: db}
}
