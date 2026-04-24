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
 * TestGetOTP verifies the retrieval of an OTP.
 */
func TestGetOTP(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "mysql")
	repo := repository.NewOTPRepository(sqlxDB)

	code := "123456"
	email := "test@example.com"
	now := time.Now()

	rows := sqlmock.NewRows([]string{
		"otp", "email", "expires_at", "used_at", "attempts", "created_at",
	}).AddRow(code, email, now.Add(time.Minute), nil, 0, now)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT otp, email, expires_at")).
		WithArgs(code).
		WillReturnRows(rows)

	otp, err := repo.GetOTP(context.Background(), code)

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if otp == nil {
		t.Fatal("expected otp, got nil")
	}

	if otp.OTP != code {
		t.Errorf("expected code %s, got %s", code, otp.OTP)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %s", err)
	}
}
