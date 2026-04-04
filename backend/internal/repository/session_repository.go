package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type SessionRepository interface {
	Create(ctx context.Context, s *models.IdPSession) error
	GetByID(ctx context.Context, sessionID string) (*models.IdPSession, error)
	Delete(ctx context.Context, sessionID string) error
	DeleteExpired(ctx context.Context) (int64, error)
}

type sessionRepository struct {
	db *sqlx.DB
}

func (r *sessionRepository) Create(ctx context.Context,
	s *models.IdPSession,
) error {
	query := `
        INSERT INTO idp_sessions (session_id, user_id, ip_address,
		user_agent, expires_at)
        VALUES (?, ?, ?, ?, ?)
    `
	_, err := r.db.ExecContext(ctx, query, s.SessionId, s.UserId, s.IpAddress,
		s.UserAgent, s.ExpiresAt)
	if err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}
	return nil
}

func (r *sessionRepository) GetByID(ctx context.Context,
	sessionID string,
) (*models.IdPSession, error) {
	var session models.IdPSession
	query := `SELECT session_id, user_id, ip_address, user_agent,
			  created_at, expires_at 
              FROM idp_sessions WHERE session_id = ?`

	err := r.db.GetContext(ctx, &session, query, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %w", err)
	}
	return &session, nil
}

func (r *sessionRepository) Delete(ctx context.Context,
	sessionID string,
) error {
	query := `DELETE FROM idp_sessions WHERE session_id = ?`
	_, err := r.db.ExecContext(ctx, query, sessionID)
	if err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}
	return nil
}

func (r *sessionRepository) DeleteExpired(ctx context.Context) (int64, error) {
	query := `DELETE FROM idp_sessions WHERE expires_at < ?`
	res, err := r.db.ExecContext(ctx, query, time.Now())
	if err != nil {
		return 0, fmt.Errorf("failed to clean up expired sessions: %w", err)
	}
	return res.RowsAffected()
}

func NewSessionRepository(db *sqlx.DB) SessionRepository {
	return &sessionRepository{db: db}
}
