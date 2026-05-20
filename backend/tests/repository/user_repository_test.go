package repository_test

import (
	"context"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

/**
 * TestGetUserById verifies the retrieval of a user by UUID.
 */
func TestGetUserById(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "mysql")
	repo := repository.NewUserRepository(sqlxDB)

	userID := uuid.New()
	email := "test@example.com"

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "first_name", "middle_name", "last_name", "name_suffix",
		"email", "status", "created_at", "updated_at",
		"role_id", "role_name", "role_description",
	}).AddRow(
		userID[:], "John", "Doe", "Smith", "",
		email, "active", now, now,
		1, "Admin", "Administrator role",
	)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT u.id, u.first_name")).
		WithArgs(userID[:]).
		WillReturnRows(rows)

	// Since populateSingleUserClients is called, expect both queries
	mock.ExpectQuery(regexp.QuoteMeta(
		"SELECT c.id, c.client_name FROM client_allowed_users",
	)).WithArgs(userID[:]).WillReturnRows(
		sqlmock.NewRows([]string{"id", "client_name"}),
	)

	mock.ExpectQuery(regexp.QuoteMeta(
		"SELECT c.id, c.client_name FROM admin_allowed_clients",
	)).WithArgs(userID[:]).WillReturnRows(
		sqlmock.NewRows([]string{"id", "client_name"}),
	)

	user, err := repo.GetUserById(context.Background(), userID[:])

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if user == nil {
		t.Fatal("expected user, got nil")
	}

	if user.Email != email {
		t.Errorf("expected email %s, got %s", email, user.Email)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %s", err)
	}
}
