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
	GetAccountTypeIDByInvitationCode(ctx context.Context,
		code string) (int, error)
}

type invitationRepository struct {
	db *sqlx.DB
}

func (r *invitationRepository) CreateInvitation(ctx context.Context,
	inv *models.InvitationCode,
) error {
	query := `INSERT INTO invitation_codes (email, 
                account_type_id, invitation_code) 
              VALUES (?, ?, ?)`
	_, err := r.db.ExecContext(ctx, query, inv.Email,
		inv.AccountTypeID, inv.InvitationCode)
	if err != nil {
		return fmt.Errorf("[CreateInvitation]: %w", err)
	}
	return nil
}

func (r *invitationRepository) GetInvitationByCode(ctx context.Context,
	code string,
) (*models.InvitationCode, error) {
	var inv models.InvitationCode
	query := `SELECT id, email, account_type_id, invitation_code, 
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
	query := `SELECT id, email, account_type_id, invitation_code, 
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

func (r *invitationRepository) GetAccountTypeIDByInvitationCode(
	ctx context.Context,
	code string,
) (int, error) {
	var accountTypeID int
	query := `SELECT account_type_id FROM invitation_codes WHERE invitation_code = ?`
	err := r.db.GetContext(ctx, &accountTypeID, query, code)
	if err != nil {
		return 0, fmt.Errorf("[GetAccountTypeIDByInvitationCode]: %w", err)
	}
	return accountTypeID, nil
}

func NewInvitationRepository(db *sqlx.DB) InvitationRepository {
	return &invitationRepository{db: db}
}
