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

func TestGetTotalLogins(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "mysql")
	repo := repository.NewMetricsRepository(sqlxDB)

	since := time.Now().Add(-24 * time.Hour)
	rows := sqlmock.NewRows([]string{"count"}).AddRow(15)

	q := `
		SELECT COUNT\(\*\) 
		FROM audit_logs 
		WHERE action = 'login' AND status = 'success' AND created_at >= \?`

	mock.ExpectQuery(q).WithArgs(since).WillReturnRows(rows)

	count, err := repo.GetTotalLogins(context.Background(), since, nil)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if count != 15 {
		t.Errorf("expected count 15, got %d", count)
	}
}

func TestGetTotalLoginsWithAllowedClients(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "mysql")
	repo := repository.NewMetricsRepository(sqlxDB)

	since := time.Now().Add(-24 * time.Hour)
	allowedClients := []string{"client-1", "client-2"}
	rows := sqlmock.NewRows([]string{"count"}).AddRow(10)

	// Regexp pattern matching query with IN clause
	q := `(?s)SELECT.*COUNT.*FROM audit_logs.*WHERE.*target IN.*`

	mock.ExpectQuery(q).
		WithArgs(since, "client-1", "client-2").
		WillReturnRows(rows)

	count, err := repo.GetTotalLogins(
		context.Background(),
		since,
		allowedClients,
	)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if count != 10 {
		t.Errorf("expected count 10, got %d", count)
	}
}

func TestGetTopClients(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "mysql")
	repo := repository.NewMetricsRepository(sqlxDB)

	since := time.Now().Add(-24 * time.Hour)
	rows := sqlmock.NewRows([]string{
		"client_id", "client_name", "image_location", "login_count",
	}).AddRow("client-1", "App One", "logo1.png", 25).
		AddRow("client-2", "App Two", "", 12)

	queryRegex := `(?s)SELECT.*a\.target AS client_id.*FROM audit_logs a.*LIMIT \?`
	mock.ExpectQuery(queryRegex).WithArgs(since, 5).WillReturnRows(rows)

	res, err := repo.GetTopClients(context.Background(), 5, since, nil)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if len(res) != 2 {
		t.Errorf("expected 2 clients, got %d", len(res))
	}
	if res[0].ClientName != "App One" || res[0].LoginCount != 25 {
		t.Errorf("unexpected top client: %+v", res[0])
	}
	if res[0].ImageLocation != "logo1.png" {
		t.Errorf("expected logo1.png, got %s", res[0].ImageLocation)
	}
}

func TestGetFailedAuthAttempts(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "mysql")
	repo := repository.NewMetricsRepository(sqlxDB)

	since := time.Now().Add(-1 * time.Hour)
	rows := sqlmock.NewRows([]string{
		"ip", "actor", "fail_count", "last_attempt",
	}).AddRow("192.168.1.10", "hacker", 10, since)

	mock.ExpectQuery(regexp.QuoteMeta(`
		SELECT 
			COALESCE(JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.ip')), '') AS ip,
			COALESCE(actor, '') AS actor,
			COUNT(*) AS fail_count,
			MAX(created_at) AS last_attempt
		FROM audit_logs
		WHERE action = 'login' AND status = 'fail' AND created_at >= ?
		GROUP BY ip, actor
		ORDER BY fail_count DESC`)).WithArgs(since).WillReturnRows(rows)

	res, err := repo.GetFailedAuthAttempts(context.Background(), since, nil)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if len(res) != 1 {
		t.Errorf("expected 1 failed attempt, got %d", len(res))
	}
	if res[0].IP != "192.168.1.10" || res[0].FailCount != 10 {
		t.Errorf("unexpected result: %+v", res[0])
	}
}
