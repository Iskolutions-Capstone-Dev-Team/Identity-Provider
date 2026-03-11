package repository

import (
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type LogRepository struct {
	db *sqlx.DB
}

func (r *LogRepository) GetUserEmailbyID(userID []byte) (string, error) {
	var email string
	query := `select email from users where id = ?`
	err := r.db.Get(&email, query, userID)
	if err != nil {
		return "", err
	}
	return email, nil
}

func (r *LogRepository) GetClientNameByID(clientID []byte) (string, error) {
	var name string
	query := `select client_name from clients where id = ?`
	err := r.db.Get(&name, query, clientID)
	if err != nil {
		return "", err
	}
	return name, nil
}

// CreateLog inserts a new audit log entry.
func (r *LogRepository) CreateLog(log *models.AuditLog) error {
	query := `INSERT INTO audit_logs (actor, action, target, status, metadata) 
              VALUES (?, ?, ?, ?, ?)`

	_, err := r.db.Exec(query, log.Actor, log.Action, log.Target,
		log.Status, log.Metadata)
	if err != nil {
		return fmt.Errorf("[LogRepository] Database Query: %w", err)
	}
	return nil
}

// GetLog retrieves a single audit log entry based on specific filters.
func (r *LogRepository) GetLog(actor *string, status string) (
	*models.AuditLog, error,
) {
	var log models.AuditLog
	query := `SELECT id, actor, action, target, status, metadata, created_at 
              FROM audit_logs 
              WHERE (actor = ? OR ? IS NULL) AND (status = ? OR ? = '') 
              LIMIT 1`

	err := r.db.Get(&log, query, actor, actor, status, status)
	if err != nil {
		return nil, fmt.Errorf("[LogRepository] Database Query: %w", err)
	}
	return &log, nil
}

// GetLogList retrieves a slice of audit logs with pagination support.
func (r *LogRepository) GetLogList(limit, offset int) ([]models.AuditLog, error) {
	query := `SELECT id, actor, action, target, status, metadata, created_at 
              FROM audit_logs 
              ORDER BY created_at DESC LIMIT ? OFFSET ?`

	var logs []models.AuditLog
	err := r.db.Select(&logs, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("[LogRepository] Database Query: %w", err)
	}
	return logs, nil
}

func NewLogRepository(db *sqlx.DB) *LogRepository {
	return &LogRepository{
		db: db,
	}
}
