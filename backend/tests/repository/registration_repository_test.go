package repository_test

import (
	"context"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/jmoiron/sqlx"
)

/**
 * TestGetAccountTypeIDByName verifies the retrieval of an account type ID.
 */
func TestGetAccountTypeIDByName(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "mysql")
	repo := repository.NewRegistrationRepository(sqlxDB)

	name := "Student"
	expectedID := 1

	rows := sqlmock.NewRows([]string{"id"}).AddRow(expectedID)

	mock.ExpectQuery("SELECT id FROM account_types WHERE lower\\(name\\) = ?").
		WithArgs("student").
		WillReturnRows(rows)

	id, err := repo.GetAccountTypeIDByName(context.Background(), name)

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if id != expectedID {
		t.Errorf("expected ID %d, got %d", expectedID, id)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %s", err)
	}
}
