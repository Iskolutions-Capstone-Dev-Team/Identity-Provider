package repository

import (
	"context"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type ClientAllowedUserRepository interface {
	GetAll(ctx context.Context) ([]models.ClientAllowedUser, error)
	GetByAdmin(ctx context.Context,
		adminID []byte) ([]models.ClientAllowedUser, error)
	SyncUserAccess(ctx context.Context, userID []byte,
		clientIDs [][]byte, adminID []byte) error
	SyncPreapprovedUserAccess(ctx context.Context, userID []byte,
		clientIDs [][]byte) error
	AssignClientAccess(ctx context.Context, userID []byte,
		clientID []byte, source models.AssignmentSource) error
	BatchAssignClientAccess(ctx context.Context, userID []byte,
		clientIDs [][]byte, source models.AssignmentSource) error
}

type clientAllowedUserRepository struct {
	db *sqlx.DB
}

// GetAll retrieves all user-client access mappings.
func (r *clientAllowedUserRepository) GetAll(ctx context.Context,
) ([]models.ClientAllowedUser, error) {
	var mappings []models.ClientAllowedUser
	query := `
	SELECT
	    client_id,
	    user_id,
	    assigned_at,
	    assignment_source
	FROM
	    client_allowed_users
	`
	err := r.db.SelectContext(ctx, &mappings, query)
	if err != nil {
		return nil, fmt.Errorf("[GetAll]: %w", err)
	}
	return mappings, nil
}

// GetByAdmin retrieves all mappings for clients that a specific admin manages.
func (r *clientAllowedUserRepository) GetByAdmin(ctx context.Context,
	adminID []byte,
) ([]models.ClientAllowedUser, error) {
	var mappings []models.ClientAllowedUser
	query := `
		SELECT 
			cau.client_id,
			cau.user_id,
			cau.assigned_at,
			cau.assignment_source
		FROM 
			client_allowed_users cau
		JOIN admin_allowed_clients aac ON cau.client_id = aac.client_id
		WHERE 
			aac.user_id = ?
	`
	err := r.db.SelectContext(ctx, &mappings, query, adminID)
	if err != nil {
		return nil, fmt.Errorf("[GetByAdmin]: %w", err)
	}
	return mappings, nil
}

// SyncUserAccess updates a user's client access within the scope of an admin.
func (r *clientAllowedUserRepository) SyncUserAccess(ctx context.Context,
	userID []byte, clientIDs [][]byte, adminID []byte,
) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Get clients managed by this admin
	var scopedClients [][]byte
	scopeQuery := `
		SELECT 
			client_id
		FROM 
			admin_allowed_clients
		WHERE 
			user_id = ?
	`
	err = tx.SelectContext(ctx, &scopedClients, scopeQuery, adminID)
	if err != nil {
		return fmt.Errorf("sync: fetch scope: %w", err)
	}

	if len(scopedClients) == 0 {
		return fmt.Errorf("sync: admin has no managed clients")
	}

	// 2. Get existing mappings within scope to preserve their source
	var existing []models.ClientAllowedUser
	existQuery, args, err := sqlx.In(
		`SELECT client_id, assignment_source FROM client_allowed_users 
		 WHERE user_id = ? AND client_id IN (?)`,
		userID, scopedClients,
	)
	if err == nil {
		existQuery = r.db.Rebind(existQuery)
		_ = tx.SelectContext(ctx, &existing, existQuery, args...)
	}
	sourceMap := make(map[string]models.AssignmentSource)
	for _, e := range existing {
		sourceMap[string(e.ClientID)] = e.AssignmentSource
	}

	// 3. Clear current user mappings THAT FALL WITHIN admin's scope
	deleteQuery, args, err := sqlx.In(
		`DELETE FROM client_allowed_users 
		 WHERE user_id = ? AND client_id IN (?)`,
		userID, scopedClients,
	)
	if err != nil {
		return fmt.Errorf("sync: delete query prep: %w", err)
	}
	deleteQuery = r.db.Rebind(deleteQuery)
	_, err = tx.ExecContext(ctx, deleteQuery, args...)
	if err != nil {
		return fmt.Errorf("sync: delete execution: %w", err)
	}

	// 4. Insert new mappings
	scopeMap := make(map[string]bool)
	for _, id := range scopedClients {
		scopeMap[string(id)] = true
	}

	for _, reqID := range clientIDs {
		if scopeMap[string(reqID)] {
			source := models.SourceManual
			if oldSource, ok := sourceMap[string(reqID)]; ok {
				source = oldSource
			}

			insertQuery := `
			INSERT INTO 
				client_allowed_users (client_id, user_id, assignment_source) 
			VALUES (?, ?, ?)`
			_, err = tx.ExecContext(ctx, insertQuery, reqID, userID, source)
			if err != nil {
				return fmt.Errorf("sync: insert %x: %w", reqID, err)
			}
		}
	}

	return tx.Commit()
}

// AssignClientAccess directly links a user to a client.
func (r *clientAllowedUserRepository) AssignClientAccess(ctx context.Context,
	userID []byte, clientID []byte, source models.AssignmentSource,
) error {
	query := `
		INSERT INTO 
			client_allowed_users (client_id, user_id, assignment_source) 
		VALUES 
			(?, ?, ?)
	`
	_, err := r.db.ExecContext(ctx, query, clientID, userID, source)
	return err
}

// BatchAssignClientAccess links a user to multiple clients in one transaction.
func (r *clientAllowedUserRepository) BatchAssignClientAccess(
	ctx context.Context, userID []byte, clientIDs [][]byte,
	source models.AssignmentSource,
) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO 
			client_allowed_users (client_id, user_id, assignment_source) 
		VALUES 
			(?, ?, ?)
	`
	for _, clientID := range clientIDs {
		_, err = tx.ExecContext(ctx, query, clientID, userID, source)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// SyncPreapprovedUserAccess replaces all preapproved client mappings for a user.
func (r *clientAllowedUserRepository) SyncPreapprovedUserAccess(
	ctx context.Context, userID []byte, clientIDs [][]byte,
) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Delete existing PREAPPROVED mappings for this user
	deleteQuery := `
		DELETE FROM client_allowed_users 
		WHERE user_id = ? AND assignment_source = ?
	`
	_, err = tx.ExecContext(ctx, deleteQuery, userID, models.SourcePreapproved)
	if err != nil {
		return fmt.Errorf("sync preapproved: delete: %w", err)
	}

	// 2. Insert new PREAPPROVED mappings
	if len(clientIDs) > 0 {
		insertQuery := `
			INSERT INTO 
				client_allowed_users (client_id, user_id, assignment_source) 
			VALUES 
				(?, ?, ?)
		`
		for _, clientID := range clientIDs {
			_, err = tx.ExecContext(ctx, insertQuery, clientID, userID,
				models.SourcePreapproved)
			if err != nil {
				return fmt.Errorf("sync preapproved: insert %x: %w",
					clientID, err)
			}
		}
	}

	return tx.Commit()
}

func NewClientAllowedUserRepository(db *sqlx.DB) ClientAllowedUserRepository {
	return &clientAllowedUserRepository{db: db}
}
