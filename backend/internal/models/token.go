package models

import (
	"database/sql"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type AuthorizationCode struct {
	Code        string       `db:"code"`
	ClientId    []byte       `db:"client_id"`
	UserId      []byte       `db:"user_id"`
	ExpiresAt   time.Time    `db:"expires_at"`
	UsedAt      sql.NullTime `db:"used_at"`
	RedirectURI string       `db:"redirect_uri"`
}

type RefreshToken struct {
	ID        int       `db:"id"`
	Token     string    `db:"token"`
	ClientId  []byte    `db:"client_id"`
	UserId    []byte    `db:"user_id"`
	ExpiresAt time.Time `db:"expires_at"`
	Revoked   bool      `db:"revoked"`
}

type UserClaims struct {
	jwt.RegisteredClaims
	UserID     []byte   `json:"userId"`
	Username   string   `json:"userName"`
	FirstName  string   `json:"firstName"`
	MiddleName string   `json:"middleName"`
	LastName   string   `json:"lastName"`
	Email      string   `json:"email"`
	Roles      []string `json:"roles"`
	Scopes     []string `json:"scopes"`
}
