package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
)

type RoleService struct {
	RoleRepo   *repository.RoleRepository
	ClientRepo *repository.ClientRepository
}

/**
 * CreateRole handles the creation of a new role and automatically
 * binds it to a client based on the prefix of the role name.
 */
func (s *RoleService) CreateRole(
	ctx context.Context,
	req dto.RoleRequest,
) error {
	role := models.Role{
		RoleName:    req.RoleName,
		Description: req.Description,
	}

	result, err := s.RoleRepo.CreateRole(role)
	if err != nil {
		return fmt.Errorf("Database Query (CreateRole): %w", err)
	}

	roleID, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("Database Query (LastInsertId): %w", err)
	}

	// Logic: Role name "client_tag:role_name"
	// extracts "client_tag"
	tag := strings.Split(req.RoleName, ":")[0]

	err = s.ClientRepo.AddClientAllowedRole(int(roleID), tag)
	if err != nil {
		return fmt.Errorf("Database Query (BindRoleToClient): %w", err)
	}

	return nil
}

/**
 * GetRoleList retrieves a paginated list of roles and 
 * calculates pagination metadata.
 */
func (s *RoleService) GetRoleList(
	ctx context.Context,
	limit,
	page int,
) (*dto.RoleListResponse, error) {
	offset := (page - 1) * limit

	roles, err := s.RoleRepo.ListRoles(limit, offset)
	if err != nil {
		return nil, fmt.Errorf("Database Query (ListRoles): %w", err)
	}

	total, err := s.RoleRepo.CountRoles()
	if err != nil {
		return nil, fmt.Errorf("Database Query (CountRoles): %w", err)
	}

	var roleResponses []dto.RoleResponse
	for _, r := range roles {
		roleResponses = append(roleResponses, dto.RoleResponse{
			ID:          r.ID,
			RoleName:    r.RoleName,
			Description: r.Description,
			CreatedAt:   r.CreatedAt.Format(TIME_LAYOUT),
			UpdatedAt:   r.UpdatedAt.Format(TIME_LAYOUT),
		})
	}

	lastPage := (total + limit - 1) / limit
	if lastPage == 0 {
		lastPage = 1
	}

	return &dto.RoleListResponse{
		Roles:       roleResponses,
		CurrentPage: page,
		LastPage:    lastPage,
		TotalCount:  total,
	}, nil
}

/**
 * GetRoleByID retrieves a single role by its integer ID 
 * and formats it into a DTO.
 */
func (s *RoleService) GetRoleByID(
	ctx context.Context, 
	id int,
) (*dto.RoleResponse, error) {
	role, err := s.RoleRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetByID): %w", err)
	}

	return &dto.RoleResponse{
		ID:          role.ID,
		RoleName:    role.RoleName,
		Description: role.Description,
		CreatedAt:   role.CreatedAt.Format(TIME_LAYOUT),
		UpdatedAt:   role.UpdatedAt.Format(TIME_LAYOUT),
	}, nil
}

/**
 * SearchRoles finds roles based on a keyword and returns a 
 * formatted list response.
 */
func (s *RoleService) SearchRoles(
	ctx context.Context, 
	keyword string,
) (*dto.RoleListResponse, error) {
	roles, err := s.RoleRepo.SearchRoles(keyword)
	if err != nil {
		return nil, fmt.Errorf("Database Query (SearchRoles): %w", err)
	}

	if len(roles) == 0 {
		return nil, fmt.Errorf("Database Query (SearchRoles): no records")
	}

	var roleResponses []dto.RoleResponse
	for _, r := range roles {
		roleResponses = append(roleResponses, dto.RoleResponse{
			ID:          r.ID,
			RoleName:    r.RoleName,
			Description: r.Description,
			CreatedAt:   r.CreatedAt.Format(TIME_LAYOUT),
			UpdatedAt:   r.UpdatedAt.Format(TIME_LAYOUT),
		})
	}

	return &dto.RoleListResponse{
		Roles:       roleResponses,
		CurrentPage: DEFAULT_PAGE,
		LastPage:    DEFAULT_PAGE,
		TotalCount:  len(roleResponses),
	}, nil
}

func GetRoleNames(roles []models.Role) []string {
	return utils.Map(roles, func(role models.Role) string {
		return role.RoleName
	})
}

/**
 * UpdateRole modifies an existing role record in the database.
 */
func (s *RoleService) UpdateRole(
	ctx context.Context,
	id int,
	req dto.RoleRequest,
) error {
	role := models.Role{
		ID:          id,
		RoleName:    req.RoleName,
		Description: req.Description,
	}

	if err := s.RoleRepo.UpdateRole(role); err != nil {
		return fmt.Errorf("Database Query (UpdateRole): %w", err)
	}

	return nil
}

/**
 * DeleteRole removes a role record from the system by its 
 * unique integer identifier.
 */
func (s *RoleService) DeleteRole(ctx context.Context, id int) error {
	if err := s.RoleRepo.Delete(id); err != nil {
		return fmt.Errorf("Database Query (Delete): %w", err)
	}

	return nil
}
