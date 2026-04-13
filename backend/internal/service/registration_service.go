package service

import (
	"context"
	"fmt"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/google/uuid"
)

type RegistrationService interface {
	GetRegistrationConfig(ctx context.Context) (*dto.RegistrationConfigResponse, error)
	GetClientsByAccountTypeID(ctx context.Context, 
		id int) (*dto.AccountTypeConfigResponse, error)
	CreateAccountType(ctx context.Context, 
		req dto.UpsertAccountTypeRequest) error
	UpdateAccountType(ctx context.Context, 
		req dto.UpsertAccountTypeRequest) error
	DeleteAccountType(ctx context.Context, id int) error
	ActivateAccount(ctx context.Context, 
		req dto.ActivateAccountRequest) error
	CheckInvitation(ctx context.Context, 
		code string) (bool, error)
}

type regService struct {
	repo         repository.RegistrationRepository
	invitation   repository.InvitationRepository
	user         repository.UserRepository
}

func NewRegistrationService(
	repo repository.RegistrationRepository,
	invitation repository.InvitationRepository,
	user repository.UserRepository,
) RegistrationService {
	return &regService{
		repo:       repo,
		invitation: invitation,
		user:       user,
	}
}

func (s *regService) GetRegistrationConfig(ctx context.Context) (
	*dto.RegistrationConfigResponse, error) {
	rows, err := s.repo.GetRegistrationConfig(ctx)
	if err != nil {
		return nil, err
	}

	configMap := make(map[string][]dto.PreapprovedClientResponse)
	idMap := make(map[string]int)
	var order []string

	for _, row := range rows {
		if _, ok := configMap[row.AccountTypeName]; !ok {
			order = append(order, row.AccountTypeName)
			configMap[row.AccountTypeName] = []dto.PreapprovedClientResponse{}
			idMap[row.AccountTypeName] = row.AccountTypeID
		}
		if len(row.ClientID) > 0 {
			id, _ := uuid.FromBytes(row.ClientID)
			configMap[row.AccountTypeName] = append(configMap[row.AccountTypeName], 
				dto.PreapprovedClientResponse{
					ID:   id,
					Name: row.ClientName,
				})
		}
	}

	var resp dto.RegistrationConfigResponse
	for _, name := range order {
		cfg := dto.AccountTypeConfigResponse{
			ID:          idMap[name],
			AccountType: name,
			Clients:     configMap[name],
		}
		resp.AccountTypes = append(resp.AccountTypes, cfg)
	}

	return &resp, nil
}

func (s *regService) GetClientsByAccountTypeID(ctx context.Context, 
	id int) (*dto.AccountTypeConfigResponse, error) {
	rows, err := s.repo.GetClientsByAccountTypeID(ctx, id)
	if err != nil {
		return nil, err
	}

	if len(rows) == 0 {
		return &dto.AccountTypeConfigResponse{}, nil
	}

	clients := make([]dto.PreapprovedClientResponse, 0)
	for _, row := range rows {
		if len(row.ClientID) == 0 {
			continue
		}
		clientID, _ := uuid.FromBytes(row.ClientID)
		clients = append(clients, dto.PreapprovedClientResponse{
			ID:   clientID,
			Name: row.ClientName,
		})
	}

	return &dto.AccountTypeConfigResponse{
		ID:          rows[0].AccountTypeID,
		AccountType: rows[0].AccountTypeName,
		Clients:     clients,
	}, nil
}

func (s *regService) CreateAccountType(ctx context.Context, 
	req dto.UpsertAccountTypeRequest) error {
	id, err := s.repo.CreateAccountType(ctx, req.Name)
	if err != nil {
		return err
	}

	var clientIDs []uuid.UUID
	for _, idStr := range req.ClientIDs {
		clientID, err := uuid.Parse(idStr)
		if err != nil {
			return err
		}
		clientIDs = append(clientIDs, clientID)
	}

	return s.repo.SyncPreapprovedClients(ctx, id, clientIDs)
}

func (s *regService) UpdateAccountType(ctx context.Context, 
	req dto.UpsertAccountTypeRequest) error {
	err := s.repo.UpdateAccountType(ctx, req.ID, req.Name)
	if err != nil {
		return err
	}

	var clientIDs []uuid.UUID
	for _, idStr := range req.ClientIDs {
		clientID, err := uuid.Parse(idStr)
		if err != nil {
			return err
		}
		clientIDs = append(clientIDs, clientID)
	}

	return s.repo.SyncPreapprovedClients(ctx, req.ID, clientIDs)
}

func (s *regService) DeleteAccountType(ctx context.Context, id int) error {
	return s.repo.DeleteAccountType(ctx, id)
}

func (s *regService) ActivateAccount(ctx context.Context, 
	req dto.ActivateAccountRequest) error {
	inv, err := s.invitation.GetInvitationByCode(ctx, req.InvitationCode)
	if err != nil {
		return err
	}

	user, err := s.user.GetUserByEmail(ctx, inv.Email)
	if err != nil {
		return err
	}

	if user == nil {
		return fmt.Errorf("user not found for invitation")
	}

	hashed, err := utils.HashSecret(req.Password)
	if err != nil {
		return fmt.Errorf("password hashing failed: %w", err)
	}

	err = s.user.UpdateUserPassword(ctx, &models.User{
		ID:           user.ID,
		PasswordHash: hashed,
	})
	if err != nil {
		return err
	}

	return s.invitation.DeleteInvitation(ctx, inv.Email)
}

func (s *regService) CheckInvitation(ctx context.Context, 
	code string) (bool, error) {
	inv, err := s.invitation.GetInvitationByCode(ctx, code)
	if err != nil {
		return false, err
	}

	if inv == nil {
		return false, nil
	}

	// Expiry check: 24 hours
	if time.Since(inv.CreatedAt) > 24*time.Hour {
		return false, nil
	}

	return true, nil
}
