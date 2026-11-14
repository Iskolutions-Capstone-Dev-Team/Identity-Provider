package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type RetentionRepository interface {
	StreamLogsOlderThan(
		ctx context.Context,
		tableName string,
		cutoff time.Time,
		fn func(entry models.AuditLog) error,
	) (int64, error)
	BatchDeleteLogsOlderThan(
		ctx context.Context,
		tableName string,
		cutoff time.Time,
		batchSize int,
	) (int64, error)
	GetOldestLogTimestamp(
		ctx context.Context,
		tableName string,
	) (*time.Time, error)
}

type retentionRepository struct {
	db *sqlx.DB
}

func NewRetentionRepository(db *sqlx.DB) RetentionRepository {
	return &retentionRepository{db: db}
}

func (r *retentionRepository) StreamLogsOlderThan(
	ctx context.Context,
	tableName string,
	cutoff time.Time,
	fn func(entry models.AuditLog) error,
) (int64, error) {
	if tableName != "audit_logs" && tableName != "security_logs" {
		return 0, fmt.Errorf("invalid table name: %s", tableName)
	}

	query := fmt.Sprintf(`
		SELECT id, actor, action, target, metadata, status, created_at
		FROM %s
		WHERE created_at < ?
		ORDER BY id ASC
	`, tableName)

	rows, err := r.db.QueryxContext(ctx, query, cutoff)
	if err != nil {
		return 0, err
	}
	defer rows.Close()

	var count int64
	for rows.Next() {
		var entry models.AuditLog
		if err := rows.StructScan(&entry); err != nil {
			return count, err
		}
		if err := fn(entry); err != nil {
			return count, err
		}
		count++
	}
	return count, rows.Err()
}

func (r *retentionRepository) BatchDeleteLogsOlderThan(
	ctx context.Context,
	tableName string,
	cutoff time.Time,
	batchSize int,
) (int64, error) {
	if tableName != "audit_logs" && tableName != "security_logs" {
		return 0, fmt.Errorf("invalid table name: %s", tableName)
	}

	if batchSize <= 0 {
		batchSize = 1000
	}

	deleteQuery := fmt.Sprintf(`
		DELETE FROM %s
		WHERE created_at < ?
		LIMIT %d
	`, tableName, batchSize)

	var totalDeleted int64
	for {
		res, err := r.db.ExecContext(ctx, deleteQuery, cutoff)
		if err != nil {
			return totalDeleted, err
		}

		rowsAffected, err := res.RowsAffected()
		if err != nil {
			return totalDeleted, err
		}

		totalDeleted += rowsAffected
		if rowsAffected < int64(batchSize) {
			// All matching rows deleted
			break
		}

		// Small pause to yield locks and prevent InnoDB starvation
		time.Sleep(25 * time.Millisecond)
	}

	return totalDeleted, nil
}

func (r *retentionRepository) GetOldestLogTimestamp(
	ctx context.Context,
	tableName string,
) (*time.Time, error) {
	if tableName != "audit_logs" && tableName != "security_logs" {
		return nil, fmt.Errorf("invalid table name: %s", tableName)
	}

	query := fmt.Sprintf(`
		SELECT created_at
		FROM %s
		ORDER BY created_at ASC
		LIMIT 1
	`, tableName)

	var oldest time.Time
	err := r.db.GetContext(ctx, &oldest, query)
	if err != nil {
		return nil, err
	}
	return &oldest, nil
}

