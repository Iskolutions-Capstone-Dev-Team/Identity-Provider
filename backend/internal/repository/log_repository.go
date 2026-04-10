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

	CreateSecurityLog(ctx context.Context, log *models.AuditLog) error
	GetSecurityLog(ctx context.Context, actor *string, status string) (
		*models.AuditLog, error,
	)
	GetSecurityLogList(ctx context.Context, limit, offset int) ([]models.AuditLog,
		error)
	GetSecurityLogByID(ctx context.Context, id int64) (*models.AuditLog, error)
	GetSecurityLogListWithFilters(ctx context.Context,
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

// createLogInternal inserts a new log entry to the specified table.
func (r *logRepository) createLogInternal(ctx context.Context, table string,
	log *models.AuditLog,
) error {
	query := fmt.Sprintf(`INSERT INTO %s (actor, action, target, status, metadata) 
              VALUES (?, ?, ?, ?, ?)`, table)

	_, err := r.db.ExecContext(ctx, query, log.Actor, log.Action, log.Target,
		log.Status, log.Metadata)
	if err != nil {
		return fmt.Errorf("[LogRepository] Database Query: %w", err)
	}
	return nil
}

// CreateLog inserts a new audit log entry.
func (r *logRepository) CreateLog(ctx context.Context,
	log *models.AuditLog,
) error {
	return r.createLogInternal(ctx, "audit_logs", log)
}

// CreateSecurityLog inserts a new security log entry.
func (r *logRepository) CreateSecurityLog(ctx context.Context,
	log *models.AuditLog,
) error {
	return r.createLogInternal(ctx, "security_logs", log)
}

func (r *logRepository) getLogInternal(ctx context.Context, table string,
	actor *string, status string,
) (*models.AuditLog, error) {
	var log models.AuditLog
	query := fmt.Sprintf(`SELECT id, actor, action, target, status, metadata, created_at 
              FROM %s 
              WHERE (actor = ? OR ? IS NULL) AND (status = ? OR ? = '') 
              LIMIT 1`, table)

	err := r.db.GetContext(ctx, &log, query, actor, actor, status, status)
	if err != nil {
		return nil, fmt.Errorf("[LogRepository] Database Query: %w", err)
	}
	return &log, nil
}

// GetLog retrieves a single audit log entry based on specific filters.
func (r *logRepository) GetLog(ctx context.Context, actor *string,
	status string,
) (*models.AuditLog, error) {
	return r.getLogInternal(ctx, "audit_logs", actor, status)
}

// GetSecurityLog retrieves a single security log entry based on specific filters.
func (r *logRepository) GetSecurityLog(ctx context.Context, actor *string,
	status string,
) (*models.AuditLog, error) {
	return r.getLogInternal(ctx, "security_logs", actor, status)
}

func (r *logRepository) getLogListInternal(ctx context.Context, table string, limit,
	offset int,
) ([]models.AuditLog, error) {
	query := fmt.Sprintf(`SELECT id, actor, action, target, status, metadata, created_at 
              FROM %s 
              ORDER BY created_at DESC LIMIT ? OFFSET ?`, table)

	var logs []models.AuditLog
	err := r.db.SelectContext(ctx, &logs, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("[LogRepository] Database Query: %w", err)
	}
	return logs, nil
}

// GetLogList retrieves a slice of audit logs with pagination support.
func (r *logRepository) GetLogList(ctx context.Context, limit,
	offset int,
) ([]models.AuditLog, error) {
	return r.getLogListInternal(ctx, "audit_logs", limit, offset)
}

// GetSecurityLogList retrieves a slice of security logs with pagination support.
func (r *logRepository) GetSecurityLogList(ctx context.Context, limit,
	offset int,
) ([]models.AuditLog, error) {
	return r.getLogListInternal(ctx, "security_logs", limit, offset)
}

func (r *logRepository) getLogByIDInternal(ctx context.Context, table string,
	id int64,
) (*models.AuditLog, error) {
	var log models.AuditLog
	query := fmt.Sprintf(`SELECT id, actor, action, target, status, metadata, created_at 
	          FROM %s WHERE id = ?`, table)
	err := r.db.GetContext(ctx, &log, query, id)
	if err != nil {
		return nil, fmt.Errorf("[LogRepository] Database Query: %w", err)
	}
	return &log, nil
}

// GetLogByID retrieves a single audit log entry by its ID.
func (r *logRepository) GetLogByID(ctx context.Context,
	id int64,
) (*models.AuditLog, error) {
	return r.getLogByIDInternal(ctx, "audit_logs", id)
}

// GetSecurityLogByID retrieves a single security log entry by its ID.
func (r *logRepository) GetSecurityLogByID(ctx context.Context,
	id int64,
) (*models.AuditLog, error) {
	return r.getLogByIDInternal(ctx, "security_logs", id)
}

func (r *logRepository) getLogListWithFiltersInternal(ctx context.Context,
	table string, filters map[string]interface{}, limit, offset int,
) ([]models.AuditLog, int64, error) {
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

	countQuery := fmt.Sprintf(
		`SELECT COUNT(*) FROM %s WHERE %s`, table, whereClause)
	var total int64
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("[LogRepository] Count Query: %w", err)
	}

	dataQuery := fmt.Sprintf(
		`SELECT id, actor, action, target, status, metadata, created_at 
		 FROM %s WHERE %s ORDER BY created_at DESC LIMIT ? OFFSET ?`,
		table, whereClause)
	args = append(args, limit, offset)

	var logs []models.AuditLog
	err = r.db.SelectContext(ctx, &logs, dataQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("[LogRepository] Data Query: %w", err)
	}

	return logs, total, nil
}

// GetLogListWithFilters retrieves a slice of audit logs with filtering.
func (r *logRepository) GetLogListWithFilters(ctx context.Context,
	filters map[string]interface{}, limit, offset int,
) ([]models.AuditLog, int64, error) {
	return r.getLogListWithFiltersInternal(ctx, "audit_logs", filters, limit, offset)
}

// GetSecurityLogListWithFilters retrieves a slice of security logs with filtering.
func (r *logRepository) GetSecurityLogListWithFilters(ctx context.Context,
	filters map[string]interface{}, limit, offset int,
) ([]models.AuditLog, int64, error) {
	return r.getLogListWithFiltersInternal(ctx, "security_logs", filters, limit, offset)
}

func NewLogRepository(db *sqlx.DB) LogRepository {
	return &logRepository{
		db: db,
	}
}
