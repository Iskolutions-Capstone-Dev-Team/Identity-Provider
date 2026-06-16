package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type MetricsRepository interface {
	GetTotalLogins(ctx context.Context, since time.Time,
		allowedClients []string) (int, error)
	GetTopClients(ctx context.Context, limit int, since time.Time,
		allowedClients []string) ([]models.TopClientLogin, error)
	GetFailedAuthAttempts(ctx context.Context, since time.Time,
		allowedClients []string) ([]models.FailedAuthAttempt, error)
	GetBoundClientIDs(ctx context.Context, userID []byte) (
		[]string, error)
}

type metricsRepository struct {
	db *sqlx.DB
}

func NewMetricsRepository(db *sqlx.DB) MetricsRepository {
	return &metricsRepository{db: db}
}

func (r *metricsRepository) GetTotalLogins(ctx context.Context,
	since time.Time, allowedClients []string,
) (int, error) {
	if allowedClients != nil && len(allowedClients) == 0 {
		return 0, nil
	}

	var count int
	query := `
		SELECT COUNT(*) 
		FROM audit_logs 
		WHERE action = 'login' AND status = 'success' AND created_at >= ?`

	var args = []interface{}{since}

	if allowedClients != nil {
		query += " AND target IN (?)"
		args = append(args, allowedClients)

		var err error
		query, args, err = sqlx.In(query, args...)
		if err != nil {
			return 0, fmt.Errorf(
				"[MetricsRepository] GetTotalLogins sqlx.In: %w",
				err,
			)
		}
		query = r.db.Rebind(query)
	}

	err := r.db.GetContext(ctx, &count, query, args...)
	if err != nil {
		return 0, fmt.Errorf("[MetricsRepository] GetTotalLogins: %w", err)
	}
	return count, nil
}

func (r *metricsRepository) GetTopClients(ctx context.Context,
	limit int, since time.Time, allowedClients []string,
) ([]models.TopClientLogin, error) {
	if allowedClients != nil && len(allowedClients) == 0 {
		return []models.TopClientLogin{}, nil
	}

	var topClients []models.TopClientLogin
	query := `
		SELECT 
			a.target AS client_id,
			COALESCE(c.client_name, a.target) AS client_name,
			COALESCE(c.image_location, '') AS image_location,
			COUNT(*) AS login_count
		FROM audit_logs a
		LEFT JOIN clients c ON BIN_TO_UUID(c.id) = a.target
		WHERE a.action = 'login' AND a.status = 'success' AND a.created_at >= ?`

	var args = []interface{}{since}

	if allowedClients != nil {
		query += " AND a.target IN (?)"
		args = append(args, allowedClients)
	}

	query += `
		GROUP BY a.target, c.client_name, c.image_location
		ORDER BY login_count DESC
		LIMIT ?`
	args = append(args, limit)

	if allowedClients != nil {
		var err error
		query, args, err = sqlx.In(query, args...)
		if err != nil {
			return nil, fmt.Errorf(
				"[MetricsRepository] GetTopClients sqlx.In: %w",
				err,
			)
		}
		query = r.db.Rebind(query)
	}

	err := r.db.SelectContext(ctx, &topClients, query, args...)
	if err != nil {
		return nil, fmt.Errorf("[MetricsRepository] GetTopClients: %w", err)
	}
	return topClients, nil
}

func (r *metricsRepository) GetFailedAuthAttempts(ctx context.Context,
	since time.Time, allowedClients []string,
) ([]models.FailedAuthAttempt, error) {
	if allowedClients != nil && len(allowedClients) == 0 {
		return []models.FailedAuthAttempt{}, nil
	}

	var attempts []models.FailedAuthAttempt
	query := `
		SELECT 
			COALESCE(JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.ip')), '') AS ip,
			COALESCE(actor, '') AS actor,
			COUNT(*) AS fail_count,
			MAX(created_at) AS last_attempt
		FROM audit_logs
		WHERE action = 'login' AND status = 'fail' AND created_at >= ?`

	var args = []interface{}{since}

	if allowedClients != nil {
		query += " AND target IN (?)"
		args = append(args, allowedClients)

		var err error
		query, args, err = sqlx.In(query, args...)
		if err != nil {
			return nil, fmt.Errorf(
				"[MetricsRepository] GetFailedAuthAttempts sqlx.In: %w",
				err,
			)
		}
		query = r.db.Rebind(query)
	}

	query += `
		GROUP BY ip, actor
		ORDER BY fail_count DESC`

	err := r.db.SelectContext(ctx, &attempts, query, args...)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetFailedAuthAttempts: %w", err)
	}
	return attempts, nil
}

func (r *metricsRepository) GetBoundClientIDs(ctx context.Context,
	userID []byte,
) ([]string, error) {
	var clientIDs [][]byte
	query := `
		SELECT client_id 
		FROM admin_allowed_clients 
		WHERE user_id = ?
	`
	err := r.db.SelectContext(ctx, &clientIDs, query, userID)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetBoundClientIDs: %w",
			err,
		)
	}

	var stringIDs []string
	for _, id := range clientIDs {
		u, err := uuid.FromBytes(id)
		if err == nil {
			stringIDs = append(stringIDs, u.String())
		}
	}
	return stringIDs, nil
}
