package service

import (
	"context"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
)

type PermissionService struct {
	Repo repository.PermissionRepository
}

func (s *PermissionService) GetAllPermissions(ctx context.Context,
) ([]dto.PermissionResponse, error) {
	permissions, err := s.Repo.GetAllPermissions(ctx)
	if err != nil {
		return nil, err
	}

	var response []dto.PermissionResponse
	for _, p := range permissions {
		response = append(response, dto.PermissionResponse{
			ID:         p.ID,
			Permission: p.PermissionName,
		})
	}
	return response, nil
}