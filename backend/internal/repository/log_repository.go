package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type LogRepository interface {
	GetUserEmailbyID(ctx context.Context, userID []byte) (string, error)
	GetClientNameByID(ctx context.Context, clientID []byte) (string, error)
	CreateLog(ctx context.Context, log *models.AuditLog) error
	GetLog(ctx context.Context, actor *string, status string) (
		*models.AuditLog, error)
	GetLogList(ctx context.Context, limit, offset int) ([]models.AuditLog,
		error)
	GetLogByID(ctx context.Context, id int64) (*models.AuditLog, error)
	GetLogListWithFilters(ctx context.Context,
		filters map[string]interface{}, limit, offset int) ([]models.AuditLog,
		int64, error)
}

type logRepository struct {
	db *sqlx.DB
}

func (r *logRepository) GetUserEmailbyID(ctx context.Context,
	userID []byte,
) (string, error) {
	var email string
	query := `select email from users where id = ?`
	err := r.db.GetContext(ctx, &email, query, userID)
	if err != nil {
		return "", err
	}
	return email, nil
}

func (r *logRepository) GetClientNameByID(ctx context.Context,
	clientID []byte,
) (string, error) {
	var name string
	query := `select client_name from clients where id = ?`
	err := r.db.GetContext(ctx, &name, query, clientID)
	if err != nil {
		return "", err
	}
	return name, nil
}

// CreateLog inserts a new audit log entry.
func (r *logRepository) CreateLog(ctx context.Context,
	log *models.AuditLog,
) error {
	query := `INSERT INTO audit_logs (actor, action, target, status, metadata) 
              VALUES (?, ?, ?, ?, ?)`

	_, err := r.db.ExecContext(ctx, query, log.Actor, log.Action, log.Target,
		log.Status, log.Metadata)
	if err != nil {
		return fmt.Errorf("[LogRepository] Database Query: %w", err)
	}
	return nil
}

// GetLog retrieves a single audit log entry based on specific filters.
func (r *logRepository) GetLog(ctx context.Context, actor *string,
	status string,
) (*models.AuditLog, error) {
	var log models.AuditLog
	query := `SELECT id, actor, action, target, status, metadata, created_at 
              FROM audit_logs 
              WHERE (actor = ? OR ? IS NULL) AND (status = ? OR ? = '') 
              LIMIT 1`

	err := r.db.GetContext(ctx, &log, query, actor, actor, status, status)
	if err != nil {
		return nil, fmt.Errorf("[LogRepository] Database Query: %w", err)
	}
	return &log, nil
}

// GetLogList retrieves a slice of audit logs with pagination support.
func (r *logRepository) GetLogList(ctx context.Context, limit,
	offset int,
) ([]models.AuditLog, error) {
	query := `SELECT id, actor, action, target, status, metadata, created_at 
              FROM audit_logs 
              ORDER BY created_at DESC LIMIT ? OFFSET ?`

	var logs []models.AuditLog
	err := r.db.SelectContext(ctx, &logs, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("[LogRepository] Database Query: %w", err)
	}
	return logs, nil
}

// GetLogByID retrieves a single audit log entry by its ID.
func (r *logRepository) GetLogByID(ctx context.Context,
	id int64,
) (*models.AuditLog, error) {
	var log models.AuditLog
	query := `SELECT id, actor, action, target, status, metadata, created_at 
	          FROM audit_logs WHERE id = ?`
	err := r.db.GetContext(ctx, &log, query, id)
	if err != nil {
		return nil, fmt.Errorf("[LogRepository] Database Query: %w", err)
	}
	return &log, nil
}

// GetLogListWithFilters retrieves a slice of audit logs with filtering.
func (r *logRepository) GetLogListWithFilters(ctx context.Context,
	filters map[string]interface{}, limit, offset int,
) ([]models.AuditLog, int64, error) {
	// Build WHERE clause dynamically
	where := []string{"1=1"}
	args := []interface{}{}
	if actor, ok := filters["actor"]; ok && actor != nil {
		where = append(where, "actor = ?")
		args = append(args, actor)
	}
	if action, ok := filters["action"]; ok && action != "" {
		where = append(where, "action = ?")
		args = append(args, action)
	}
	if target, ok := filters["target"]; ok && target != "" {
		where = append(where, "target = ?")
		args = append(args, target)
	}
	if status, ok := filters["status"]; ok && status != "" {
		where = append(where, "status = ?")
		args = append(args, status)
	}
	if from, ok := filters["from_date"]; ok && from != "" {
		where = append(where, "created_at >= ?")
		args = append(args, from)
	}
	if to, ok := filters["to_date"]; ok && to != "" {
		where = append(where, "created_at <= ?")
		args = append(args, to)
	}

	whereClause := strings.Join(where, " AND ")

	// Count total
	countQuery := fmt.Sprintf(
		`SELECT COUNT(*) FROM audit_logs WHERE %s`, whereClause)
	var total int64
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("[LogRepository] Count Query: %w", err)
	}

	// Fetch paginated data
	dataQuery := fmt.Sprintf(
		`SELECT id, actor, action, target, status, metadata, created_at 
		 FROM audit_logs WHERE %s ORDER BY created_at DESC LIMIT ? OFFSET ?`,
		whereClause)
	args = append(args, limit, offset)

	var logs []models.AuditLog
	err = r.db.SelectContext(ctx, &logs, dataQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("[LogRepository] Data Query: %w", err)
	}

	return logs, total, nil
}

func NewLogRepository(db *sqlx.DB) LogRepository {
	return &logRepository{
		db: db,
	}
}
