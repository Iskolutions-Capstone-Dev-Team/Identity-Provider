package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type AuthCodeRepository interface {
	StoreCode(ctx context.Context, code string, userID []byte,
		clientID []byte, redirectURI string) error
	ExchangeCode(ctx context.Context,
		code string) (*models.AuthorizationCode, error)
	GetUserForAuth(ctx context.Context,
		email string) (*models.UserClaims, string, error)
	VerifyClient(ctx context.Context, clientID []byte,
		clientSecret string) (bool, error)
	GetClaimsByID(ctx context.Context,
		userId []byte) (*models.UserClaims, error)
	StoreRefreshToken(ctx context.Context, token string, userID []byte,
		clientID []byte) error
	RotateRefreshToken(ctx context.Context, oldToken,
		newToken string) error
	GetIDsFromToken(ctx context.Context,
		token string) ([]byte, []byte, error)
	GetClientRedirectURI(ctx context.Context,
		clientID []byte) (string, error)
	RevokeTokens(ctx context.Context, userID []byte) error
}

type authCodeRepository struct {
	db *sqlx.DB
}

const (
	YEARS  = 0
	MONTHS = 0
	DAYS   = 7
)

// StoreCode saves the generated code
func (r *authCodeRepository) StoreCode(ctx context.Context, code string,
	userID []byte, clientID []byte, redirectURI string,
) error {
	query := `
		INSERT INTO authorization_codes 
			(code, user_id, client_id, redirect_uri, expires_at) 
        VALUES (?, ?, ?, ?, ?)`
	expiresAt := time.Now().Add(5 * time.Minute) // Codes are very short-lived
	_, err := r.db.ExecContext(ctx, query, code, userID, clientID,
		redirectURI, expiresAt)
	return err
}

// ExchangeCode uses a transaction to find, lock, and "consume" the code
func (r *authCodeRepository) ExchangeCode(ctx context.Context,
	code string,
) (*models.AuthorizationCode, error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var authCode models.AuthorizationCode
	query := `SELECT code, user_id, client_id, redirect_uri, expires_at, used_at 
              FROM authorization_codes WHERE code = ? FOR UPDATE`

	err = tx.GetContext(ctx, &authCode, query, code)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("code not found")
		}
		return nil, err
	}

	if authCode.UsedAt.Valid {
		return nil, errors.New("code already exchanged")
	}
	if time.Now().After(authCode.ExpiresAt) {
		return nil, errors.New("code expired")
	}

	_, err = tx.ExecContext(ctx,
		"UPDATE authorization_codes SET used_at = NOW() WHERE code = ?",
		code)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &authCode, nil
}

func (r *authCodeRepository) GetUserForAuth(ctx context.Context,
	email string,
) (*models.UserClaims, string, error) {
	var row struct {
		ID           []byte `db:"id"`
		FirstName    string `db:"first_name"`
		MiddleName   string `db:"middle_name"`
		LastName     string `db:"last_name"`
		Email        string `db:"email"`
		PasswordHash string `db:"password_hash"`
		Status       string `db:"status"`
		RolesString  string `db:"roles"`
	}

	query := `CALL GetUserForAuth(?)`
	err := r.db.GetContext(ctx, &row, query, email)
	if err != nil {
		return nil, "", err
	}

	userID, err := uuid.FromBytes(row.ID)
	if err != nil {
		return nil, "", err
	}

	claims := &models.UserClaims{
		UserID: userID.String(),
	}

	return claims, row.PasswordHash, nil
}

func (r *authCodeRepository) VerifyClient(ctx context.Context,
	clientID []byte, clientSecret string,
) (bool, error) {
	var storedHash string
	query := `SELECT client_secret FROM clients WHERE id = ?`

	err := r.db.GetContext(ctx, &storedHash, query, clientID)
	if err != nil {
		return false, err
	}

	err = utils.CompareSecret(storedHash, clientSecret)
	return err == nil, nil
}

func (r *authCodeRepository) GetClaimsByID(ctx context.Context,
	userId []byte,
) (*models.UserClaims, error) {
	var row struct {
		ID []byte `db:"id"`
	}

	query := `
        SELECT 
            u.id
        FROM users u
        WHERE u.id = ? AND u.status = 'active'
        LIMIT 1`

	err := r.db.GetContext(ctx, &row, query, userId)
	if err != nil {
		return nil, err
	}

	userID, err := uuid.FromBytes(row.ID)
	if err != nil {
		return nil, err
	}

	return &models.UserClaims{
		UserID: userID.String(),
	}, nil
}

func (r *authCodeRepository) StoreRefreshToken(ctx context.Context,
	token string, userID []byte, clientID []byte,
) error {
	expirationDate := time.Now().AddDate(YEARS, MONTHS, DAYS)
	query := `
		INSERT INTO refresh_tokens(token, client_id, user_id, expires_at)
		VALUES (?, ?, ?, ?)
	`
	_, err := r.db.ExecContext(ctx, query, token, clientID, userID,
		expirationDate)
	if err != nil {
		return err
	}

	return nil
}

func (r *authCodeRepository) RotateRefreshToken(ctx context.Context,
	oldToken, newToken string,
) error {
	newExpiresAt := time.Now().AddDate(YEARS, MONTHS, DAYS)

	query := `CALL RotateRefreshToken(?, ?, ?)`
	_, err := r.db.ExecContext(ctx, query, oldToken, newToken, newExpiresAt)
	if err != nil {
		return err
	}

	return nil
}

func (r *authCodeRepository) GetIDsFromToken(ctx context.Context,
	token string,
) ([]byte, []byte, error) {
	var IDs struct {
		UserID   []byte `db:"user_id"`
		ClientID []byte `db:"client_id"`
	}

	query := `
        SELECT user_id, client_id FROM refresh_tokens
        WHERE token = ?
    `

	err := r.db.GetContext(ctx, &IDs, query, token)
	if err != nil {
		return nil, nil, err
	}

	return IDs.UserID, IDs.ClientID, nil
}

func (r *authCodeRepository) GetClientRedirectURI(ctx context.Context,
	clientID []byte,
) (string, error) {
	var registeredURI string
	query := `SELECT redirect_uri FROM clients WHERE id = ?`

	err := r.db.GetContext(ctx, &registeredURI, query, clientID)
	if err != nil {
		return "", err
	}
	return registeredURI, nil
}

func (r *authCodeRepository) RevokeTokens(ctx context.Context,
	userID []byte,
) error {
	query := `CALL LogoutUser(?)`
	_, err := r.db.ExecContext(ctx, query, userID)
	if err != nil {
		return err
	}
	return nil
}

func NewAuthCodeRepository(db *sqlx.DB) AuthCodeRepository {
	return &authCodeRepository{
		db: db,
	}
}
