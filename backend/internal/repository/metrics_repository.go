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
	GetClientMetrics(
		ctx context.Context,
	) ([]models.MetricCard, error)
	GetRoleMetrics(
		ctx context.Context,
	) ([]models.MetricCard, error)
	GetUserMetrics(
		ctx context.Context,
	) ([]models.MetricCard, error)
	GetLogMetrics(
		ctx context.Context,
	) ([]models.MetricCard, error)
	GetPermissionMetrics(
		ctx context.Context,
	) ([]models.MetricCard, error)
	GetRegistrationMetrics(
		ctx context.Context,
	) ([]models.MetricCard, error)
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

func (r *metricsRepository) GetClientMetrics(
	ctx context.Context,
) ([]models.MetricCard, error) {
	var total, active int64
	err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM clients")
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetClientMetrics total: %w",
			err,
		)
	}
	err = r.db.GetContext(
		ctx,
		&active,
		"SELECT COUNT(*) FROM clients WHERE deleted_at IS NULL",
	)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetClientMetrics active: %w",
			err,
		)
	}

	return []models.MetricCard{
		{
			Title:       "Total Clients",
			Value:       fmt.Sprintf("%d", total),
			Description: "Total registered applications",
		},
		{
			Title:       "Active Clients",
			Value:       fmt.Sprintf("%d", active),
			Description: "Active applications (not deleted)",
		},
	}, nil
}

func (r *metricsRepository) GetRoleMetrics(
	ctx context.Context,
) ([]models.MetricCard, error) {
	var total, active int64
	err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM roles")
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetRoleMetrics total: %w",
			err,
		)
	}
	err = r.db.GetContext(
		ctx,
		&active,
		"SELECT COUNT(*) FROM roles WHERE deleted_at IS NULL",
	)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetRoleMetrics active: %w",
			err,
		)
	}

	return []models.MetricCard{
		{
			Title:       "Total Roles",
			Value:       fmt.Sprintf("%d", total),
			Description: "Total defined access roles",
		},
		{
			Title:       "Active Roles",
			Value:       fmt.Sprintf("%d", active),
			Description: "Active access roles (not deleted)",
		},
	}, nil
}

func (r *metricsRepository) GetUserMetrics(
	ctx context.Context,
) ([]models.MetricCard, error) {
	var total, active, suspended int64
	err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM users")
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetUserMetrics total: %w",
			err,
		)
	}
	err = r.db.GetContext(
		ctx,
		&active,
		"SELECT COUNT(*) FROM users "+
			"WHERE status = 'active' AND deleted_at IS NULL",
	)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetUserMetrics active: %w",
			err,
		)
	}
	err = r.db.GetContext(
		ctx,
		&suspended,
		"SELECT COUNT(*) FROM users WHERE status = 'suspended'",
	)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetUserMetrics suspended: %w",
			err,
		)
	}

	return []models.MetricCard{
		{
			Title:       "Total Users",
			Value:       fmt.Sprintf("%d", total),
			Description: "Total registered users",
		},
		{
			Title:       "Active Users",
			Value:       fmt.Sprintf("%d", active),
			Description: "Users with active status",
		},
		{
			Title:       "Suspended Users",
			Value:       fmt.Sprintf("%d", suspended),
			Description: "Suspended user accounts",
		},
	}, nil
}

func (r *metricsRepository) GetLogMetrics(
	ctx context.Context,
) ([]models.MetricCard, error) {
	var audit, security, failed int64
	err := r.db.GetContext(
		ctx,
		&audit,
		"SELECT COUNT(*) FROM audit_logs",
	)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetLogMetrics audit: %w",
			err,
		)
	}
	err = r.db.GetContext(
		ctx,
		&security,
		"SELECT COUNT(*) FROM security_logs",
	)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetLogMetrics security: %w",
			err,
		)
	}
	err = r.db.GetContext(
		ctx,
		&failed,
		"SELECT COUNT(*) FROM audit_logs WHERE status = 'fail'",
	)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetLogMetrics failed: %w",
			err,
		)
	}

	return []models.MetricCard{
		{
			Title:       "Audit Logs",
			Value:       fmt.Sprintf("%d", audit),
			Description: "Total recorded audit logs",
		},
		{
			Title:       "Security Logs",
			Value:       fmt.Sprintf("%d", security),
			Description: "Total security event logs",
		},
		{
			Title:       "Failed Activities",
			Value:       fmt.Sprintf("%d", failed),
			Description: "Failures logged in audit logs",
		},
	}, nil
}

func (r *metricsRepository) GetPermissionMetrics(
	ctx context.Context,
) ([]models.MetricCard, error) {
	var total, assigned int64
	err := r.db.GetContext(
		ctx,
		&total,
		"SELECT COUNT(*) FROM permissions",
	)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetPermissionMetrics total: %w",
			err,
		)
	}
	err = r.db.GetContext(
		ctx,
		&assigned,
		"SELECT COUNT(DISTINCT permission_id) FROM role_permissions",
	)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetPermissionMetrics assigned: %w",
			err,
		)
	}

	return []models.MetricCard{
		{
			Title:       "Total Permissions",
			Value:       fmt.Sprintf("%d", total),
			Description: "Total defined fine-grained permissions",
		},
		{
			Title:       "Assigned Permissions",
			Value:       fmt.Sprintf("%d", assigned),
			Description: "Permissions assigned to roles",
		},
	}, nil
}

func (r *metricsRepository) GetRegistrationMetrics(
	ctx context.Context,
) ([]models.MetricCard, error) {
	var types, preapproved, pending int64
	err := r.db.GetContext(
		ctx,
		&types,
		"SELECT COUNT(*) FROM account_types",
	)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetRegistrationMetrics types: %w",
			err,
		)
	}
	err = r.db.GetContext(
		ctx,
		&preapproved,
		"SELECT COUNT(*) FROM preapproved_clients",
	)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetRegistrationMetrics preapproved: %w",
			err,
		)
	}
	err = r.db.GetContext(
		ctx,
		&pending,
		"SELECT COUNT(*) FROM invitation_codes",
	)
	if err != nil {
		return nil, fmt.Errorf(
			"[MetricsRepository] GetRegistrationMetrics pending: %w",
			err,
		)
	}

	return []models.MetricCard{
		{
			Title:       "Account Types",
			Value:       fmt.Sprintf("%d", types),
			Description: "Total configured account types",
		},
		{
			Title:       "Preapproved Clients",
			Value:       fmt.Sprintf("%d", preapproved),
			Description: "Preapproved clients for registration",
		},
		{
			Title:       "Pending Invitations",
			Value:       fmt.Sprintf("%d", pending),
			Description: "Active registration invitation codes",
		},
	}, nil
}
