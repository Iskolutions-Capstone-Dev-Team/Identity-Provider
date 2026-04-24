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
 * TestGetInvitationByCode verifies retrieval of invitation code metadata.
 */
func TestGetInvitationByCode(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "mysql")
	repo := repository.NewInvitationRepository(sqlxDB)

	code := "test-invitation"
	email := "test@example.com"
	now := time.Now()

	rows := sqlmock.NewRows([]string{
		"id", "email", "account_type_id", "invitation_code", "created_at",
	}).AddRow(1, email, 2, code, now)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT id, email, account_type_id")).
		WithArgs(code).
		WillReturnRows(rows)

	inv, err := repo.GetInvitationByCode(context.Background(), code)

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if inv == nil {
		t.Fatal("expected invitation, got nil")
	}

	if inv.InvitationCode != code {
		t.Errorf("expected code %s, got %s", code, inv.InvitationCode)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %s", err)
	}
}
