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
	AssignClientAccess(ctx context.Context, userID []byte, 
		clientID []byte) error
	BatchAssignClientAccess(ctx context.Context, userID []byte, 
		clientIDs [][]byte) error
}

type clientAllowedUserRepository struct {
	db *sqlx.DB
}

// GetAll retrieves all user-client access mappings.
func (r *clientAllowedUserRepository) GetAll(ctx context.Context,
) ([]models.ClientAllowedUser, error) {
	var mappings []models.ClientAllowedUser
	query := "SELECT client_id, user_id, assigned_at FROM client_allowed_users"
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
		SELECT cau.client_id, cau.user_id, cau.assigned_at 
		FROM client_allowed_users cau
		JOIN admin_allowed_clients aac ON cau.client_id = aac.client_id
		WHERE aac.user_id = ?
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
	scopeQuery := "SELECT client_id FROM admin_allowed_clients WHERE user_id = ?"
	err = tx.SelectContext(ctx, &scopedClients, scopeQuery, adminID)
	if err != nil {
		return fmt.Errorf("Sync: fetch scope: %w", err)
	}

	if len(scopedClients) == 0 {
		return fmt.Errorf("Sync: admin has no managed clients")
	}

	// 2. Clear current user mappings THAT FALL WITHIN admin's scope
	deleteQuery, args, err := sqlx.In(
		`DELETE FROM client_allowed_users 
		 WHERE user_id = ? AND client_id IN (?)`,
		userID, scopedClients,
	)
	if err != nil {
		return fmt.Errorf("Sync: delete query prep: %w", err)
	}
	deleteQuery = r.db.Rebind(deleteQuery)
	_, err = tx.ExecContext(ctx, deleteQuery, args...)
	if err != nil {
		return fmt.Errorf("Sync: delete execution: %w", err)
	}

	// 3. Insert new mappings (only if provided clientID is within scope)
	scopeMap := make(map[string]bool)
	for _, id := range scopedClients {
		scopeMap[string(id)] = true
	}

	for _, reqID := range clientIDs {
		if scopeMap[string(reqID)] {
			insertQuery := `INSERT INTO client_allowed_users (client_id, user_id) 
			                VALUES (?, ?)`
			_, err = tx.ExecContext(ctx, insertQuery, reqID, userID)
			if err != nil {
				return fmt.Errorf("Sync: insert %x: %w", reqID, err)
			}
		}
	}

	return tx.Commit()
}

// AssignClientAccess directly links a user to a client.
func (r *clientAllowedUserRepository) AssignClientAccess(ctx context.Context, 
	userID []byte, clientID []byte,
) error {
	query := "INSERT INTO client_allowed_users (client_id, user_id) VALUES (?, ?)"
	_, err := r.db.ExecContext(ctx, query, clientID, userID)
	return err
}

// BatchAssignClientAccess links a user to multiple clients in one transaction.
func (r *clientAllowedUserRepository) BatchAssignClientAccess(
	ctx context.Context, userID []byte, clientIDs [][]byte,
) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := "INSERT INTO client_allowed_users (client_id, user_id) VALUES (?, ?)"
	for _, clientID := range clientIDs {
		_, err = tx.ExecContext(ctx, query, clientID, userID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func NewClientAllowedUserRepository(db *sqlx.DB) ClientAllowedUserRepository {
	return &clientAllowedUserRepository{db: db}
}
