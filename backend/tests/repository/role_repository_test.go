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
 * TestGetRoleByID verifies the retrieval of a role by ID.
 */
func TestGetRoleByID(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "mysql")
	repo := repository.NewRoleRepository(sqlxDB)

	roleID := 1
	roleName := "Admin"
	now := time.Now()

	// 1. Mock main role query
	roleRows := sqlmock.NewRows([]string{
		"id", "role_name", "description", "created_at", "updated_at",
	}).AddRow(roleID, roleName, "Admin role", now, now)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT id, role_name")).
		WithArgs(roleID).
		WillReturnRows(roleRows)

	// 2. Mock permissions query
	permRows := sqlmock.NewRows([]string{"role_id", "id", "permission"}).
		AddRow(roleID, 1, "create_user").
		AddRow(roleID, 2, "delete_user")

	mock.ExpectQuery(regexp.QuoteMeta("SELECT rp.role_id, p.id, p.permission")).
		WithArgs(roleID).
		WillReturnRows(permRows)

	role, err := repo.GetByID(context.Background(), roleID)

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if role == nil {
		t.Fatal("expected role, got nil")
	}

	if role.RoleName != roleName {
		t.Errorf("expected name %s, got %s", roleName, role.RoleName)
	}

	if len(role.Permissions) != 2 {
		t.Errorf("expected 2 permissions, got %d", len(role.Permissions))
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %s", err)
	}
}
