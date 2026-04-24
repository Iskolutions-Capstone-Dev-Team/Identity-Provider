package service

import (
	"context"
	"fmt"
	"slices"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/google/uuid"
)

type RoleService interface {
	CreateRole(ctx context.Context, req dto.RoleRequest) error
	GetFilteredRoleList(ctx context.Context, permissions []string, userID uuid.UUID,
		limit, page int, keyword string) (*dto.RoleListResponse, error)
	GetRoleList(ctx context.Context, limit, page int,
		keyword string) (*dto.RoleListResponse, error)
	GetAllExceptIDP(ctx context.Context, limit, page int,
		keyword string) (*dto.RoleListResponse, error)
	GetAuthorizedRoles(ctx context.Context, userID uuid.UUID,
		limit, page int, keyword string) (*dto.RoleListResponse, error)
	GetRoleByID(ctx context.Context, id int) (*dto.RoleResponse, error)
	SearchRoles(ctx context.Context,
		keyword string) (*dto.RoleListResponse, error)
	UpdateRole(ctx context.Context, id int, req dto.RoleRequest) error
	DeleteRole(ctx context.Context, id int) error
}

type roleService struct {
	RoleRepo repository.RoleRepository
}

func NewRoleService(roleRepo repository.RoleRepository) RoleService {
	return &roleService{RoleRepo: roleRepo}
}

/**
 * CreateRole handles the creation of a new role.
 */
func (s *roleService) CreateRole(
	ctx context.Context,
	req dto.RoleRequest,
) error {
	role := models.Role{
		RoleName:    req.RoleName,
		Description: req.Description,
		Permissions: utils.Map(req.PermissionIDs, func(id int) models.Permission {
			return models.Permission{ID: id}
		}),
	}

	_, err := s.RoleRepo.CreateRole(ctx, role)
	if err != nil {
		return fmt.Errorf("database query (CreateRole): %w", err)
	}

	return nil
}

/**
 * GetFilteredRoleList determines which roles the user can see.
 */
func (s *roleService) GetFilteredRoleList(
	ctx context.Context,
	permissions []string,
	userID uuid.UUID,
	limit int,
	page int,
	keyword string,
) (*dto.RoleListResponse, error) {
	if slices.Contains(permissions, "View roles") {
		return s.GetRoleList(ctx, limit, page, keyword)
	}

	return nil, fmt.Errorf("privilege validation: level unauthorized")
}

/**
 * GetRoleList retrieves a paginated list of roles.
 */
func (s *roleService) GetRoleList(
	ctx context.Context,
	limit,
	page int,
	keyword string,
) (*dto.RoleListResponse, error) {
	offset := (page - 1) * limit

	roles, err := s.RoleRepo.ListRoles(ctx, limit, offset, keyword)
	if err != nil {
		return nil, fmt.Errorf("database query (ListRoles): %w", err)
	}

	total, err := s.RoleRepo.CountRoles(ctx, keyword)
	if err != nil {
		return nil, fmt.Errorf("database query (CountRoles): %w", err)
	}

	return s.formatRoleListResponse(roles, total, limit, page), nil
}

/**
 * GetRoleList retrieves a paginated list of roles excluding IdP.
 */
func (s *roleService) GetAllExceptIDP(
	ctx context.Context,
	limit,
	page int,
	keyword string,
) (*dto.RoleListResponse, error) {
	offset := (page - 1) * limit

	roles, err := s.RoleRepo.ListAllExceptIdP(ctx, limit, offset, keyword)
	if err != nil {
		return nil, fmt.Errorf("database query (ListRoles): %w", err)
	}

	total, err := s.RoleRepo.CountRoles(ctx, keyword)
	if err != nil {
		return nil, fmt.Errorf("database query (CountRoles): %w", err)
	}

	return s.formatRoleListResponse(roles, total, limit, page), nil
}

/**
 * GetAuthorizedRoles retrieves a distinct list of roles for an admin.
 */
func (s *roleService) GetAuthorizedRoles(
	ctx context.Context,
	userID uuid.UUID,
	limit,
	page int,
	keyword string,
) (*dto.RoleListResponse, error) {
	offset := (page - 1) * limit

	roles, err := s.RoleRepo.ListDistinctBoundRoles(
		ctx,
		limit,
		offset,
		userID[:],
		keyword,
	)
	if err != nil {
		return nil, fmt.Errorf("database query (ListBoundRoles): %w", err)
	}

	total, err := s.RoleRepo.CountDistinctBoundRoles(ctx, userID[:], keyword)
	if err != nil {
		return nil, fmt.Errorf("database query (CountBoundRoles): %w", err)
	}

	return s.formatRoleWithMetadataListResponse(roles, total, limit, page), nil
}

/**
 * formatRoleListResponse is a helper to standardize DTO mapping.
 */
func (s *roleService) formatRoleListResponse(
	roles []models.Role,
	total,
	limit,
	page int,
) *dto.RoleListResponse {
	var res []dto.RoleResponse
	for _, r := range roles {
		res = append(res, dto.RoleResponse{
			ID:          r.ID,
			RoleName:    r.RoleName,
			Description: r.Description,
			CreatedAt:   r.CreatedAt.Format(TIME_LAYOUT),
			UpdatedAt:   r.UpdatedAt.Format(TIME_LAYOUT),
			CanEdit:     true,
			CanDelete:   true,
			Permissions: r.Permissions,
		})
	}

	lastPage := (total + limit - 1) / limit
	if lastPage == 0 {
		lastPage = 1
	}

	return &dto.RoleListResponse{
		Roles:       res,
		TotalCount:  total,
		CurrentPage: page,
		LastPage:    lastPage,
	}
}

func (s *roleService) formatRoleWithMetadataListResponse(
	roles []models.RoleWithMetaData,
	total,
	limit,
	page int,
) *dto.RoleListResponse {
	var res []dto.RoleResponse
	for _, r := range roles {
		res = append(res, dto.RoleResponse{
			ID:          r.ID,
			RoleName:    r.RoleName,
			Description: r.Description,
			CreatedAt:   r.CreatedAt.Format(TIME_LAYOUT),
			UpdatedAt:   r.UpdatedAt.Format(TIME_LAYOUT),
			CanEdit:     r.CanUpdate,
			CanDelete:   r.CanDelete,
			Permissions: r.Permissions,
		})
	}

	lastPage := (total + limit - 1) / limit
	if lastPage == 0 {
		lastPage = 1
	}

	return &dto.RoleListResponse{
		Roles:       res,
		TotalCount:  total,
		CurrentPage: page,
		LastPage:    lastPage,
	}
}

/**
 * GetRoleByID retrieves a single role by its integer ID.
 */
func (s *roleService) GetRoleByID(
	ctx context.Context,
	id int,
) (*dto.RoleResponse, error) {
	role, err := s.RoleRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("database query (GetByID): %w", err)
	}

	return &dto.RoleResponse{
		ID:          role.ID,
		RoleName:    role.RoleName,
		Description: role.Description,
		CreatedAt:   role.CreatedAt.Format(TIME_LAYOUT),
		UpdatedAt:   role.UpdatedAt.Format(TIME_LAYOUT),
		Permissions: role.Permissions,
	}, nil
}

/**
 * SearchRoles finds roles based on a keyword.
 */
func (s *roleService) SearchRoles(
	ctx context.Context,
	keyword string,
) (*dto.RoleListResponse, error) {
	roles, err := s.RoleRepo.SearchRoles(ctx, keyword)
	if err != nil {
		return nil, fmt.Errorf("database query (SearchRoles): %w", err)
	}

	if len(roles) == 0 {
		return nil, fmt.Errorf("database query (SearchRoles): no records")
	}

	var roleResponses []dto.RoleResponse
	for _, r := range roles {
		roleResponses = append(roleResponses, dto.RoleResponse{
			ID:          r.ID,
			RoleName:    r.RoleName,
			Description: r.Description,
			CreatedAt:   r.CreatedAt.Format(TIME_LAYOUT),
			UpdatedAt:   r.UpdatedAt.Format(TIME_LAYOUT),
			Permissions: r.Permissions,
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
 * UpdateRole modifies an existing role record.
 */
func (s *roleService) UpdateRole(
	ctx context.Context,
	id int,
	req dto.RoleRequest,
) error {
	role := models.Role{
		ID:          id,
		RoleName:    req.RoleName,
		Description: req.Description,
		Permissions: utils.Map(req.PermissionIDs, func(id int) models.Permission {
			return models.Permission{ID: id}
		}),
	}

	if err := s.RoleRepo.UpdateRole(ctx, role); err != nil {
		return fmt.Errorf("database query (UpdateRole): %w", err)
	}

	return nil
}

/**
 * DeleteRole removes a role record.
 */
func (s *roleService) DeleteRole(ctx context.Context, id int) error {
	if err := s.RoleRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("database query (Delete): %w", err)
	}

	return nil
}
