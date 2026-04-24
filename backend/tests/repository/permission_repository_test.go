package repository_test

import (
	"context"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/jmoiron/sqlx"
)

/**
 * TestGetAllPermissions verifies retrieval of all permissions.
 */
func TestGetAllPermissions(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "mysql")
	repo := repository.NewPermissionRepository(sqlxDB)

	rows := sqlmock.NewRows([]string{"id", "permission"}).
		AddRow(1, "View all users").
		AddRow(2, "Edit user")

	mock.ExpectQuery("SELECT id, permission FROM permissions").
		WillReturnRows(rows)

	perms, err := repo.GetAllPermissions(context.Background())

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if len(perms) != 2 {
		t.Errorf("expected 2 permissions, got %d", len(perms))
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %s", err)
	}
}
