package repository_test

import (
	"context"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/jmoiron/sqlx"
)

/**
 * TestGetLogByID verifies the retrieval of an audit log entry.
 */
func TestGetLogByID(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "mysql")
	repo := repository.NewLogRepository(sqlxDB)

	logID := int64(1)
	now := time.Now()

	rows := sqlmock.NewRows([]string{
		"id", "actor", "action", "target", "status", "metadata", "created_at",
	}).AddRow(logID, "actor@example.com", "login", "client-1", "success", "{}", now)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT id, actor, action, target, status, metadata, created_at FROM audit_logs")).
		WithArgs(logID).
		WillReturnRows(rows)

	logEntry, err := repo.GetLogByID(context.Background(), logID)

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if logEntry == nil {
		t.Fatal("expected log entry, got nil")
	}

	if logEntry.ID != logID {
		t.Errorf("expected ID %d, got %d", logID, logEntry.ID)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %s", err)
	}
}
