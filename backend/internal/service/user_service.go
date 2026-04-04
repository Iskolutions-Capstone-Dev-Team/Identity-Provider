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

type UserService interface {
	CreateUser(ctx context.Context, req dto.UserRequest) (uuid.UUID, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*dto.UserResponse, error)
	GetMe(ctx context.Context, userID,
		clientID uuid.UUID) (*dto.UserInfoResponse, error)
	GetFilteredUserList(ctx context.Context, permissions []string,
		userID uuid.UUID, limit, page int) (*dto.UserResponseList, error)
	GetUserList(ctx context.Context, limit,
		page int) (*dto.UserResponseList, error)
	GetBoundUserList(ctx context.Context, limit, page int,
		userID uuid.UUID) (*dto.UserResponseList, error)
	UpdateUserPassword(ctx context.Context, id uuid.UUID,
		newPassword string) error
	UpdateUserStatus(ctx context.Context, id uuid.UUID,
		newStatus string) error
	UpdateUserRoles(ctx context.Context, id uuid.UUID, roleIDs []int,
		adminID uuid.UUID, permissions []string) error
	DeleteUser(ctx context.Context, id uuid.UUID) error
}

type userService struct {
	Repo       repository.UserRepository
	ClientRepo repository.ClientRepository
}

func NewUserService(repo repository.UserRepository,
	clientRepo repository.ClientRepository,
) UserService {
	return &userService{
		Repo:       repo,
		ClientRepo: clientRepo,
	}
}

/**
 * CreateUser handles the business logic for new user registration.
 */
func (s *userService) CreateUser(
	ctx context.Context,
	req dto.UserRequest,
) (uuid.UUID, error) {
	userID := uuid.New()

	passwordHash, err := utils.HashSecret(req.Password)
	if err != nil {
		return uuid.Nil, fmt.Errorf("Secret Hashing: %w", err)
	}

	user := models.User{
		ID:           userID[:],
		FirstName:    req.FirstName,
		MiddleName:   req.MiddleName,
		LastName:     req.LastName,
		NameSuffix:   req.NameSuffix,
		Email:        req.Email,
		PasswordHash: passwordHash,
		Status:       models.StatusActive,
		RoleString:   req.Roles,
	}

	err = s.Repo.CreateUser(ctx, &user)
	if err != nil {
		return uuid.Nil, fmt.Errorf("Database Query (CreateUser): %w", err)
	}

	return userID, nil
}

/**
 * GetUserByID retrieves a single user by their UUID.
 */
func (s *userService) GetUserByID(
	ctx context.Context,
	id uuid.UUID,
) (*dto.UserResponse, error) {
	user, err := s.Repo.GetUserById(ctx, id[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetUserById): %w", err)
	}

	return &dto.UserResponse{
		ID:         id.String(),
		FirstName:  user.FirstName,
		MiddleName: user.MiddleName,
		LastName:   user.LastName,
		NameSuffix: user.NameSuffix,
		Email:      user.Email,
		Status:     string(user.Status),
		CreatedAt:  user.CreatedAt.Format(TIME_LAYOUT),
		UpdatedAt:  user.UpdatedAt.Format(TIME_LAYOUT),
	}, nil
}

/**
 * GetMe retrieves profile information for the authenticated user.
 */
func (s *userService) GetMe(
	ctx context.Context,
	userID,
	clientID uuid.UUID,
) (*dto.UserInfoResponse, error) {
	user, err := s.Repo.GetUserById(ctx, userID[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetUser): %w", err)
	}

	allowedRoles, err := s.ClientRepo.GetClientAllowedRoles(ctx, clientID[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetAllowedRoles): %w", err)
	}

	allowedMap := make(map[int]bool)
	for _, r := range allowedRoles {
		allowedMap[r.ID] = true
	}

	roleStrings := make([]string, 0)
	for _, r := range user.Roles {
		if allowedMap[r.ID] {
			roleStrings = append(roleStrings, r.RoleName)
		}
	}

	return &dto.UserInfoResponse{
		ID:         userID.String(),
		FirstName:  user.FirstName,
		MiddleName: user.MiddleName,
		LastName:   user.LastName,
		NameSuffix: user.NameSuffix,
		Email:      user.Email,
		Roles:      roleStrings,
	}, nil
}

/**
 * GetFilteredUserList routes the request to fetch either all or bound users.
 */
func (s *userService) GetFilteredUserList(
	ctx context.Context,
	permissions []string,
	userID uuid.UUID,
	limit,
	page int,
) (*dto.UserResponseList, error) {
	if slices.Contains(permissions, "View all users") {
		return s.GetUserList(ctx, limit, page)
	}

	if slices.Contains(permissions, "View users based on appclient") {
		return s.GetBoundUserList(ctx, limit, page, userID)
	}

	return nil, fmt.Errorf("Privilege Validation: unauthorized level")
}

/**
 * GetUserList retrieves a paginated list of all users.
 */
func (s *userService) GetUserList(
	ctx context.Context,
	limit,
	page int,
) (*dto.UserResponseList, error) {
	offset := (page - 1) * limit

	users, err := s.Repo.GetUserList(ctx, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetUserList): %w", err)
	}

	total, err := s.Repo.CountUsers(ctx)
	if err != nil {
		return nil, fmt.Errorf("Database Query (CountUsers): %w", err)
	}

	var userResponses []dto.UserResponse
	for _, user := range users {
		roleList, err := GetUserRoles(user.Roles)
		if err != nil {
			return nil, fmt.Errorf("Role Parsing: %w", err)
		}

		userUUID, _ := uuid.FromBytes(user.ID)
		userResponses = append(userResponses, dto.UserResponse{
			ID:         userUUID.String(),
			FirstName:  user.FirstName,
			MiddleName: user.MiddleName,
			LastName:   user.LastName,
			NameSuffix: user.NameSuffix,
			Email:      user.Email,
			Status:     string(user.Status),
			CreatedAt:  user.CreatedAt.Format(TIME_LAYOUT),
			UpdatedAt:  user.UpdatedAt.Format(TIME_LAYOUT),
			Roles:      roleList,
		})
	}

	lastPage := (total + limit - 1) / limit
	if lastPage == 0 {
		lastPage = 1
	}

	return &dto.UserResponseList{
		Users:       userResponses,
		TotalCount:  total,
		CurrentPage: page,
		LastPage:    lastPage,
	}, nil
}

/**
 * GetBoundUserList retrieves users sharing allowed client roles with admin.
 */
func (s *userService) GetBoundUserList(
	ctx context.Context,
	limit,
	page int,
	userID uuid.UUID,
) (*dto.UserResponseList, error) {
	offset := (page - 1) * limit

	users, err := s.Repo.GetBoundUserList(ctx, limit, offset, userID[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetBound): %w", err)
	}

	total, err := s.Repo.CountBoundUsers(ctx, userID[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (CountBound): %w", err)
	}

	var userResponses []dto.UserResponse
	for _, user := range users {
		roleList, err := GetUserRoles(user.Roles)
		if err != nil {
			return nil, fmt.Errorf("Role Parsing: %w", err)
		}

		userUUID, _ := uuid.FromBytes(user.ID)
		userResponses = append(userResponses, dto.UserResponse{
			ID:         userUUID.String(),
			FirstName:  user.FirstName,
			MiddleName: user.MiddleName,
			LastName:   user.LastName,
			NameSuffix: user.NameSuffix,
			Email:      user.Email,
			Status:     string(user.Status),
			CreatedAt:  user.CreatedAt.Format(TIME_LAYOUT),
			UpdatedAt:  user.UpdatedAt.Format(TIME_LAYOUT),
			Roles:      roleList,
		})
	}

	lastPage := (total + limit - 1) / limit
	if lastPage == 0 {
		lastPage = 1
	}

	return &dto.UserResponseList{
		Users:       userResponses,
		TotalCount:  total,
		CurrentPage: page,
		LastPage:    lastPage,
	}, nil
}

func GetUserRoles(roles []models.Role) ([]dto.UserRoleRepsonse, error) {
	var roleList []dto.UserRoleRepsonse
	for _, role := range roles {
		roleList = append(roleList, dto.UserRoleRepsonse{
			ID:       role.ID,
			RoleName: role.RoleName,
		})
	}
	return roleList, nil
}

/**
 * UpdateUserPassword handles hashing and persistence of new password.
 */
func (s *userService) UpdateUserPassword(
	ctx context.Context,
	id uuid.UUID,
	newPassword string,
) error {
	passwordHash, err := utils.HashSecret(newPassword)
	if err != nil {
		return fmt.Errorf("Secret Hashing: %w", err)
	}

	user := models.User{
		ID:           id[:],
		PasswordHash: passwordHash,
	}

	err = s.Repo.UpdateUserPassword(ctx, &user)
	if err != nil {
		return fmt.Errorf("Database Query (UpdatePassword): %w", err)
	}

	return nil
}

/**
 * UpdateUserStatus modifies the operational status of a user.
 */
func (s *userService) UpdateUserStatus(
	ctx context.Context,
	id uuid.UUID,
	newStatus string,
) error {
	status, err := models.MapStatus(newStatus)
	if err != nil {
		return fmt.Errorf("Status Validation: %w", err)
	}

	user := models.User{
		ID:     id[:],
		Status: status,
	}

	err = s.Repo.UpdateStatus(ctx, &user)
	if err != nil {
		return fmt.Errorf("Database Query (UpdateStatus): %w", err)
	}

	return nil
}

/**
 * UpdateUserRoles modifies associations between user and their roles.
 */
func (s *userService) UpdateUserRoles(
	ctx context.Context,
	id uuid.UUID,
	roleIDs []int,
	adminID uuid.UUID,
	permissions []string,
) error {
	if slices.Contains(permissions, "Update user roles") {
		err := s.Repo.UpdateUserRoles(ctx, id[:], roleIDs)
		if err != nil {
			return fmt.Errorf("Database Query (UpdateUserRoles): %w", err)
		}
	}

	return nil
}

/**
 * DeleteUser performs a soft-delete on a user record.
 */
func (s *userService) DeleteUser(ctx context.Context, id uuid.UUID) error {
	if err := s.Repo.SoftDelete(ctx, id[:]); err != nil {
		return fmt.Errorf("Database Query (SoftDelete): %w", err)
	}

	return nil
}
