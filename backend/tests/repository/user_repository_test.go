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
	adminID := uuid.New()
	email := "test@example.com"

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "first_name", "middle_name", "last_name", "name_suffix",
		"email", "status", "created_at", "updated_at",
		"account_type_id", "account_type",
		"role_id", "role_name", "role_description",
	}).AddRow(
		userID[:], "John", "Doe", "Smith", "",
		email, "active", now, now,
		nil, nil,
		1, "Admin", "Administrator role",
	)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT u.id, u.first_name")).
		WithArgs(userID[:]).
		WillReturnRows(rows)

	// hasViewAll=true → populateSingleUserClients is called (two queries)
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

	user, err := repo.GetUserById(
		context.Background(), userID[:], adminID[:], true,
	)

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

func TestCountAdminUsers(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "mysql")
	repo := repository.NewUserRepository(sqlxDB)

	adminID := uuid.New()

	// Test 1: hasViewAll = true
	mock.ExpectQuery(regexp.QuoteMeta(
		"SELECT COUNT(*) FROM users " +
			"WHERE deleted_at IS NULL AND role_id IS NOT NULL",
	)).WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(5))

	count, err := repo.CountAdminUsers(context.Background(), adminID[:], true)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if count != 5 {
		t.Errorf("expected count 5, got %d", count)
	}

	// Test 2: hasViewAll = false
	mock.ExpectQuery(regexp.QuoteMeta(
		"SELECT COUNT(id) FROM (",
	)).WithArgs(adminID[:], adminID[:], adminID[:]).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(2))

	count, err = repo.CountAdminUsers(context.Background(), adminID[:], false)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if count != 2 {
		t.Errorf("expected count 2, got %d", count)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %s", err)
	}
}
