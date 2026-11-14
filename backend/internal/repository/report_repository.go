package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type ReportRepository interface {
	GetAggregatedKPIs(
		ctx context.Context,
		from, to time.Time,
		logType string,
	) (*dto.AnalyticsKPISummary, error)
	GetTimeseries(
		ctx context.Context,
		from, to time.Time,
		interval string,
		logType string,
	) ([]dto.TimeseriesPoint, error)
	StreamLogs(
		ctx context.Context,
		from, to time.Time,
		logType string,
		fn func(entry models.AuditLog, entryType string) error,
	) error
}

type reportRepository struct {
	db *sqlx.DB
}

func NewReportRepository(db *sqlx.DB) ReportRepository {
	return &reportRepository{db: db}
}

type kpiRow struct {
	TotalEvents   int64 `db:"total_events"`
	SuccessEvents int64 `db:"success_events"`
	FailedEvents  int64 `db:"failed_events"`
	UniqueActors  int64 `db:"unique_actors"`
}

func (r *reportRepository) querySingleKPI(
	ctx context.Context,
	table string,
	from, to time.Time,
) (kpiRow, []dto.ActionCountMetric, error) {
	var row kpiRow
	query := fmt.Sprintf(`
		SELECT 
			COUNT(*) as total_events,
			COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END), 0) as success_events,
			COALESCE(SUM(CASE WHEN status = 'fail' THEN 1 ELSE 0 END), 0) as failed_events,
			COUNT(DISTINCT actor) as unique_actors
		FROM %s
		WHERE created_at >= ? AND created_at <= ?
	`, table)

	if err := r.db.GetContext(ctx, &row, query, from, to); err != nil {
		return row, nil, err
	}

	actionsQuery := fmt.Sprintf(`
		SELECT action, COUNT(*) as count
		FROM %s
		WHERE created_at >= ? AND created_at <= ?
		GROUP BY action
		ORDER BY count DESC
		LIMIT 5
	`, table)

	var actions []dto.ActionCountMetric
	if err := r.db.SelectContext(ctx, &actions, actionsQuery, from, to); err != nil {
		return row, nil, err
	}

	return row, actions, nil
}

func (r *reportRepository) GetAggregatedKPIs(
	ctx context.Context,
	from, to time.Time,
	logType string,
) (*dto.AnalyticsKPISummary, error) {
	summary := &dto.AnalyticsKPISummary{
		TopActions: []dto.ActionCountMetric{},
	}

	switch logType {
	case "audit":
		kpis, actions, err := r.querySingleKPI(ctx, "audit_logs", from, to)
		if err != nil {
			return nil, err
		}
		summary.TotalEvents = kpis.TotalEvents
		summary.SuccessEvents = kpis.SuccessEvents
		summary.FailedEvents = kpis.FailedEvents
		summary.UniqueActors = kpis.UniqueActors
		summary.TopActions = actions

	case "security":
		kpis, actions, err := r.querySingleKPI(ctx, "security_logs", from, to)
		if err != nil {
			return nil, err
		}
		summary.TotalEvents = kpis.TotalEvents
		summary.SuccessEvents = kpis.SuccessEvents
		summary.FailedEvents = kpis.FailedEvents
		summary.UniqueActors = kpis.UniqueActors
		summary.TopActions = actions

	default: // "all"
		auditKpi, _, err := r.querySingleKPI(ctx, "audit_logs", from, to)
		if err != nil {
			return nil, err
		}
		secKpi, _, err := r.querySingleKPI(ctx, "security_logs", from, to)
		if err != nil {
			return nil, err
		}

		summary.TotalEvents = auditKpi.TotalEvents + secKpi.TotalEvents
		summary.SuccessEvents = auditKpi.SuccessEvents + secKpi.SuccessEvents
		summary.FailedEvents = auditKpi.FailedEvents + secKpi.FailedEvents

		// Query combined unique actors and actions
		combinedActorsQuery := `
			SELECT COUNT(DISTINCT actor) FROM (
				SELECT actor FROM audit_logs WHERE created_at >= ? AND created_at <= ?
				UNION
				SELECT actor FROM security_logs WHERE created_at >= ? AND created_at <= ?
			) combined
		`
		var uniqueActors int64
		_ = r.db.GetContext(ctx, &uniqueActors, combinedActorsQuery, from, to, from, to)
		summary.UniqueActors = uniqueActors

		combinedActionsQuery := `
			SELECT action, SUM(cnt) as count FROM (
				SELECT action, COUNT(*) as cnt FROM audit_logs WHERE created_at >= ? AND created_at <= ? GROUP BY action
				UNION ALL
				SELECT action, COUNT(*) as cnt FROM security_logs WHERE created_at >= ? AND created_at <= ? GROUP BY action
			) act_summary
			GROUP BY action
			ORDER BY count DESC
			LIMIT 5
		`
		var topActions []dto.ActionCountMetric
		_ = r.db.SelectContext(ctx, &topActions, combinedActionsQuery, from, to, from, to)
		summary.TopActions = topActions
	}

	if summary.TotalEvents > 0 {
		summary.FailureRatePercent = (float64(summary.FailedEvents) / float64(summary.TotalEvents)) * 100.0
	}

	return summary, nil
}

func getBucketSQLFormat(interval string) string {
	switch interval {
	case "month":
		return "%Y-%m"
	case "week":
		return "%Y-%u"
	default:
		return "%Y-%m-%d"
	}
}

func (r *reportRepository) GetTimeseries(
	ctx context.Context,
	from, to time.Time,
	interval string,
	logType string,
) ([]dto.TimeseriesPoint, error) {
	dateFormat := getBucketSQLFormat(interval)

	var query string
	var args []interface{}

	switch logType {
	case "audit":
		query = fmt.Sprintf(`
			SELECT 
				DATE_FORMAT(created_at, '%s') as bucket,
				COUNT(*) as total,
				COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END), 0) as success,
				COALESCE(SUM(CASE WHEN status = 'fail' THEN 1 ELSE 0 END), 0) as fail
			FROM audit_logs
			WHERE created_at >= ? AND created_at <= ?
			GROUP BY bucket
			ORDER BY bucket ASC
		`, dateFormat)
		args = []interface{}{from, to}

	case "security":
		query = fmt.Sprintf(`
			SELECT 
				DATE_FORMAT(created_at, '%s') as bucket,
				COUNT(*) as total,
				COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END), 0) as success,
				COALESCE(SUM(CASE WHEN status = 'fail' THEN 1 ELSE 0 END), 0) as fail
			FROM security_logs
			WHERE created_at >= ? AND created_at <= ?
			GROUP BY bucket
			ORDER BY bucket ASC
		`, dateFormat)
		args = []interface{}{from, to}

	default: // "all"
		query = fmt.Sprintf(`
			SELECT 
				bucket,
				SUM(total) as total,
				SUM(success) as success,
				SUM(fail) as fail
			FROM (
				SELECT 
					DATE_FORMAT(created_at, '%s') as bucket,
					COUNT(*) as total,
					COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END), 0) as success,
					COALESCE(SUM(CASE WHEN status = 'fail' THEN 1 ELSE 0 END), 0) as fail
				FROM audit_logs
				WHERE created_at >= ? AND created_at <= ?
				GROUP BY bucket
				UNION ALL
				SELECT 
					DATE_FORMAT(created_at, '%s') as bucket,
					COUNT(*) as total,
					COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END), 0) as success,
					COALESCE(SUM(CASE WHEN status = 'fail' THEN 1 ELSE 0 END), 0) as fail
				FROM security_logs
				WHERE created_at >= ? AND created_at <= ?
				GROUP BY bucket
			) combined_buckets
			GROUP BY bucket
			ORDER BY bucket ASC
		`, dateFormat, dateFormat)
		args = []interface{}{from, to, from, to}
	}

	var points []dto.TimeseriesPoint
	err := r.db.SelectContext(ctx, &points, query, args...)
	if err != nil {
		return nil, err
	}
	if points == nil {
		points = []dto.TimeseriesPoint{}
	}
	return points, nil
}

func (r *reportRepository) streamTableLogs(
	ctx context.Context,
	table string,
	from, to time.Time,
	entryType string,
	fn func(entry models.AuditLog, entryType string) error,
) error {
	query := fmt.Sprintf(`
		SELECT id, actor, action, target, metadata, status, created_at
		FROM %s
		WHERE created_at >= ? AND created_at <= ?
		ORDER BY created_at ASC
	`, table)

	rows, err := r.db.QueryxContext(ctx, query, from, to)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var entry models.AuditLog
		if err := rows.StructScan(&entry); err != nil {
			return err
		}
		if err := fn(entry, entryType); err != nil {
			return err
		}
	}
	return rows.Err()
}

func (r *reportRepository) StreamLogs(
	ctx context.Context,
	from, to time.Time,
	logType string,
	fn func(entry models.AuditLog, entryType string) error,
) error {
	if logType == "audit" || logType == "all" || logType == "" {
		if err := r.streamTableLogs(ctx, "audit_logs", from, to, "audit", fn); err != nil {
			return err
		}
	}

	if logType == "security" || logType == "all" || logType == "" {
		if err := r.streamTableLogs(ctx, "security_logs", from, to, "security", fn); err != nil {
			return err
		}
	}

	return nil
}
