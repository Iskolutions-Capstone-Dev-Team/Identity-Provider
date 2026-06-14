package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type MetricsRepository interface {
	GetTotalLogins(ctx context.Context, since time.Time) (int, error)
	GetTopClients(ctx context.Context, limit int, since time.Time) (
		[]models.TopClientLogin, error)
	GetFailedAuthAttempts(ctx context.Context, since time.Time) (
		[]models.FailedAuthAttempt, error)
}

type metricsRepository struct {
	db *sqlx.DB
}

func NewMetricsRepository(db *sqlx.DB) MetricsRepository {
	return &metricsRepository{db: db}
}

func (r *metricsRepository) GetTotalLogins(ctx context.Context,
	since time.Time,
) (int, error) {
	var count int
	query := `
		SELECT COUNT(*) 
		FROM audit_logs 
		WHERE action = 'login' AND status = 'success' AND created_at >= ?`

	err := r.db.GetContext(ctx, &count, query, since)
	if err != nil {
		return 0, fmt.Errorf("[MetricsRepository] GetTotalLogins: %w", err)
	}
	return count, nil
}

func (r *metricsRepository) GetTopClients(ctx context.Context,
	limit int, since time.Time,
) ([]models.TopClientLogin, error) {
	var topClients []models.TopClientLogin
	query := `
		SELECT 
			a.target AS client_id,
			COALESCE(c.client_name, a.target) AS client_name,
			COALESCE(c.image_location, '') AS image_location,
			COUNT(*) AS login_count
		FROM audit_logs a
		LEFT JOIN clients c ON BIN_TO_UUID(c.id) = a.target
		WHERE a.action = 'login' AND a.status = 'success' AND a.created_at >= ?
		GROUP BY a.target, c.client_name, c.image_location
		ORDER BY login_count DESC
		LIMIT ?`

	err := r.db.SelectContext(ctx, &topClients, query, since, limit)
	if err != nil {
		return nil, fmt.Errorf("[MetricsRepository] GetTopClients: %w", err)
	}
	return topClients, nil
}

func (r *metricsRepository) GetFailedAuthAttempts(ctx context.Context,
	since time.Time,
) ([]models.FailedAuthAttempt, error) {
	var attempts []models.FailedAuthAttempt
	query := `
		SELECT 
			COALESCE(JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.ip')), '') AS ip,
			COALESCE(actor, '') AS actor,
			COUNT(*) AS fail_count,
			MAX(created_at) AS last_attempt
		FROM audit_logs
		WHERE action = 'login' AND status = 'fail' AND created_at >= ?
		GROUP BY ip, actor
		ORDER BY fail_count DESC`

	err := r.db.SelectContext(ctx, &attempts, query, since)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetFailedAuthAttempts: %w", err)
	}
	return attempts, nil
}
