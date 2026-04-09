package service

import (
	"context"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/google/uuid"
)

type RegistrationService interface {
	GetRegistrationConfig(ctx context.Context) (*dto.RegistrationConfigResponse, error)
	GetClientsByAccountTypeID(ctx context.Context, 
		id int) (*dto.AccountTypeConfigResponse, error)
	UpdatePreapprovedClients(ctx context.Context, 
		req dto.UpdatePreapprovedClientsRequest) error
}

type regService struct {
	repo repository.RegistrationRepository
}

func NewRegistrationService(repo repository.RegistrationRepository) RegistrationService {
	return &regService{repo: repo}
}

func (s *regService) GetRegistrationConfig(ctx context.Context) (
	*dto.RegistrationConfigResponse, error) {
	rows, err := s.repo.GetRegistrationConfig(ctx)
	if err != nil {
		return nil, err
	}

	configMap := make(map[string][]dto.PreapprovedClientResponse)
	var order []string

	for _, row := range rows {
		if _, ok := configMap[row.AccountTypeName]; !ok {
			order = append(order, row.AccountTypeName)
			configMap[row.AccountTypeName] = []dto.PreapprovedClientResponse{}
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
		clientID, _ := uuid.FromBytes(row.ClientID)
		clients = append(clients, dto.PreapprovedClientResponse{
			ID:   clientID,
			Name: row.ClientName,
		})
	}

	return &dto.AccountTypeConfigResponse{
		AccountType: rows[0].AccountTypeName,
		Clients:     clients,
	}, nil
}

func (s *regService) UpdatePreapprovedClients(ctx context.Context, 
	req dto.UpdatePreapprovedClientsRequest) error {
	var clientIDs []uuid.UUID
	for _, idStr := range req.ClientIDs {
		id, err := uuid.Parse(idStr)
		if err != nil {
			return err
		}
		clientIDs = append(clientIDs, id)
	}
	return s.repo.SyncPreapprovedClients(ctx, req.AccountTypeID, clientIDs)
}
