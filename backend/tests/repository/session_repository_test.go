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
 * TestGetSessionByID verifies retrieval of a session by ID.
 */
func TestGetSessionByID(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "mysql")
	repo := repository.NewSessionRepository(sqlxDB)

	sessionID := "sess-123"
	userID := []byte("user-uuid")
	now := time.Now()

	rows := sqlmock.NewRows([]string{
		"session_id", "user_id", "ip_address", "user_agent", "created_at", "expires_at",
	}).AddRow(sessionID, userID, "127.0.0.1", "curl", now, now.Add(time.Hour))

	mock.ExpectQuery(regexp.QuoteMeta("SELECT session_id, user_id, ip_address")).
		WithArgs(sessionID).
		WillReturnRows(rows)

	session, err := repo.GetByID(context.Background(), sessionID)

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if session == nil {
		t.Fatal("expected session, got nil")
	}

	if session.SessionId != sessionID {
		t.Errorf("expected ID %s, got %s", sessionID, session.SessionId)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %s", err)
	}
}
