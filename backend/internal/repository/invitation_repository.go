package repository

import (
	"context"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/jmoiron/sqlx"
)

type InvitationRepository interface {
	CreateInvitation(ctx context.Context, inv *models.InvitationCode) error
	GetInvitationByCode(ctx context.Context,
		code string) (*models.InvitationCode, error)
	GetInvitationByEmail(ctx context.Context,
		email string) (*models.InvitationCode, error)
	DeleteInvitation(ctx context.Context, email string) error
}

type invitationRepository struct {
	db *sqlx.DB
}

func (r *invitationRepository) CreateInvitation(ctx context.Context,
	inv *models.InvitationCode,
) error {
	query := `INSERT INTO invitation_codes (email, 
                invitation_type, invitation_code) 
              VALUES (?, ?, ?)`
	_, err := r.db.ExecContext(ctx, query, inv.Email,
		inv.InvitationType, inv.InvitationCode)
	if err != nil {
		return fmt.Errorf("[CreateInvitation]: %w", err)
	}
	return nil
}

func (r *invitationRepository) GetInvitationByCode(ctx context.Context,
	code string,
) (*models.InvitationCode, error) {
	var inv models.InvitationCode
	query := `SELECT id, email, invitation_type, invitation_code, 
                     created_at 
              FROM invitation_codes WHERE invitation_code = ?`
	err := r.db.GetContext(ctx, &inv, query, code)
	if err != nil {
		return nil, fmt.Errorf("[GetInvitationByCode]: %w", err)
	}
	return &inv, nil
}

func (r *invitationRepository) GetInvitationByEmail(ctx context.Context,
	email string,
) (*models.InvitationCode, error) {
	var inv models.InvitationCode
	query := `SELECT id, email, invitation_type, invitation_code, 
                     created_at 
              FROM invitation_codes WHERE email = ?`
	err := r.db.GetContext(ctx, &inv, query, email)
	if err != nil {
		return nil, fmt.Errorf("[GetInvitationByEmail]: %w", err)
	}
	return &inv, nil
}

func (r *invitationRepository) DeleteInvitation(ctx context.Context,
	email string,
) error {
	query := `DELETE FROM invitation_codes WHERE email = ?`
	_, err := r.db.ExecContext(ctx, query, email)
	return err
}

func NewInvitationRepository(db *sqlx.DB) InvitationRepository {
	return &invitationRepository{db: db}
}
