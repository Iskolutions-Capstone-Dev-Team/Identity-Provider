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
 * TestGetClientByID verifies the retrieval of a client by UUID.
 */
func TestGetClientByID(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "mysql")
	repo := repository.NewClientRepository(sqlxDB)

	clientID := uuid.New()
	clientName := "Test Client"

	now := time.Now()
	// 1. Mock main client query
	clientRows := sqlmock.NewRows([]string{
		"id", "client_name", "description",
		"image_location", "base_url",
		"redirect_uri", "logout_uri", "updated_at",
	}).AddRow(
		clientID[:], clientName, "A test client",
		"/img.png", "http://localhost:3000",
		"http://localhost:3000/callback", "http://localhost:3000/logout",
		&now,
	)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT id, client_name")).
		WithArgs(clientID[:]).
		WillReturnRows(clientRows)

	// 2. Mock grant types query
	grantRows := sqlmock.NewRows([]string{"grant_type"}).
		AddRow("authorization_code").
		AddRow("refresh_token")

	mock.ExpectQuery(regexp.QuoteMeta("SELECT grant_type FROM client_grant_types")).
		WithArgs(clientID[:]).
		WillReturnRows(grantRows)

	// 3. Mock allowed roles query
	roleRows := sqlmock.NewRows([]string{"id", "role_name", "description"})

	mock.ExpectQuery(regexp.QuoteMeta("SELECT r.id, r.role_name")).
		WithArgs(clientID[:]).
		WillReturnRows(roleRows)

	client, err := repo.GetByID(context.Background(), clientID[:])

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if client == nil {
		t.Fatal("expected client, got nil")
	}

	if client.ClientName != clientName {
		t.Errorf("expected name %s, got %s", clientName, client.ClientName)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %s", err)
	}
}
