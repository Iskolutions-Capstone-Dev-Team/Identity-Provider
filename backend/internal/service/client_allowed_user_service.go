package service

import (
	"context"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
)

type ClientAllowedUserService interface {
	GetAllMappings(ctx context.Context) ([]models.ClientAllowedUser, error)
	GetMappingsByAdmin(ctx context.Context, 
		adminID []byte) ([]models.ClientAllowedUser, error)
	SyncAccess(ctx context.Context, userID []byte, 
		clientIDs [][]byte, adminID []byte) error
}

type clientAllowedUserService struct {
	repo repository.ClientAllowedUserRepository
}

// GetAllMappings fetches every user-client mapping globally.
func (s *clientAllowedUserService) GetAllMappings(ctx context.Context,
) ([]models.ClientAllowedUser, error) {
	return s.repo.GetAll(ctx)
}

// GetMappingsByAdmin fetches mappings filtered by admin's managed clients.
func (s *clientAllowedUserService) GetMappingsByAdmin(ctx context.Context, 
	adminID []byte,
) ([]models.ClientAllowedUser, error) {
	return s.repo.GetByAdmin(ctx, adminID)
}

// SyncAccess updates user mapping within the permitted admin scope.
func (s *clientAllowedUserService) SyncAccess(ctx context.Context, 
	userID []byte, clientIDs [][]byte, adminID []byte,
) error {
	// Business logic could be added here (e.g. check permissions)
	err := s.repo.SyncUserAccess(ctx, userID, clientIDs, adminID)
	if err != nil {
		return fmt.Errorf("[SyncAccess]: %w", err)
	}
	return nil
}

func NewClientAllowedUserService(
	repo repository.ClientAllowedUserRepository,
) ClientAllowedUserService {
	return &clientAllowedUserService{repo: repo}
}
