package service

import (
	"context"
	"database/sql"
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
	GetMe(ctx context.Context, userID uuid.UUID) (*dto.UserInfoResponse, error)
	GetFilteredUserList(ctx context.Context, permissions []string,
		userID uuid.UUID, limit,
		page int) (*dto.UserSimplifiedResponseList, error)
	GetUserList(ctx context.Context, limit,
		page int) (*dto.UserSimplifiedResponseList, error)
	GetBoundUserList(ctx context.Context, limit, page int,
		userID uuid.UUID) (*dto.UserSimplifiedResponseList, error)
	GetAdminUserList(ctx context.Context, limit,
		page int) (*dto.UserResponseList, error)
	UpdateUserPassword(ctx context.Context, id uuid.UUID,
		newPassword string) error
	UpdateUserStatus(ctx context.Context, id uuid.UUID,
		newStatus string) error
	UpdateUserRole(ctx context.Context, id uuid.UUID, roleID *int,
		adminID uuid.UUID, permissions []string) error
	DeleteUser(ctx context.Context, id uuid.UUID) error
}

type userService struct {
	Repo       repository.UserRepository
	ClientRepo repository.ClientRepository
	RegRepo    repository.RegistrationRepository
	CAURepo    repository.ClientAllowedUserRepository
}

func NewUserService(
	repo repository.UserRepository,
	clientRepo repository.ClientRepository,
	regRepo repository.RegistrationRepository,
	cauRepo repository.ClientAllowedUserRepository,
) UserService {
	return &userService{
		Repo:       repo,
		ClientRepo: clientRepo,
		RegRepo:    regRepo,
		CAURepo:    cauRepo,
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
		RoleID: sql.NullInt64{
			Valid: req.RoleID != nil,
		},
	}
	if req.RoleID != nil {
		user.RoleID.Int64 = int64(*req.RoleID)
	}

	err = s.Repo.CreateUser(ctx, &user)
	if err != nil {
		return uuid.Nil, fmt.Errorf("Database Query (CreateUser): %w", err)
	}

	if req.AccountType != "" {
		typeID, err := s.RegRepo.GetAccountTypeIDByName(ctx, req.AccountType)
		if err != nil {
			return userID, fmt.Errorf("Post-Create (TypeLookup): %w", err)
		}

		clients, err := s.RegRepo.GetClientsByAccountTypeID(ctx, typeID)
		if err != nil {
			return userID, fmt.Errorf("Post-Create (RegFetch): %w", err)
		}

		if len(clients) > 0 {
			clientIDs := make([][]byte, 0, len(clients))
			for _, c := range clients {
				clientIDs = append(clientIDs, c.ClientID)
			}
			err = s.CAURepo.BatchAssignClientAccess(ctx, user.ID, clientIDs)
			if err != nil {
				return userID, fmt.Errorf("Post-Create (Assign): %w", err)
			}
		}
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

	if user == nil {
		return nil, fmt.Errorf("user not found")
	}
	return s.mapToUserResponse(*user, id), nil
}

/**
 * GetMe retrieves profile information for the authenticated user.
 */
func (s *userService) GetMe(
	ctx context.Context,
	userID uuid.UUID,
) (*dto.UserInfoResponse, error) {
	user, err := s.Repo.GetUserById(ctx, userID[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetUser): %w", err)
	}

	return &dto.UserInfoResponse{
		ID:         userID.String(),
		FirstName:  user.FirstName,
		MiddleName: user.MiddleName,
		LastName:   user.LastName,
		NameSuffix: user.NameSuffix,
		Email:      user.Email,
		Roles:      user.Role.RoleName,
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
) (*dto.UserSimplifiedResponseList, error) {
	var resp *dto.UserSimplifiedResponseList
	var err error

	if slices.Contains(permissions, "View all users") {
		resp, err = s.GetUserList(ctx, limit, page)
	} else if slices.Contains(permissions, "View users based on appclient") {
		resp, err = s.GetBoundUserList(ctx, limit, page, userID)
	} else {
		return nil, fmt.Errorf("Privilege Validation: unauthorized level")
	}

	if err != nil {
		return nil, err
	}

	return resp, nil
}

/**
 * GetUserList retrieves a paginated list of all users.
 */
func (s *userService) GetUserList(
	ctx context.Context,
	limit,
	page int,
) (*dto.UserSimplifiedResponseList, error) {
	offset := (page - 1) * limit

	users, err := s.Repo.GetUserList(ctx, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetUserList): %w", err)
	}

	total, err := s.Repo.CountUsers(ctx)
	if err != nil {
		return nil, fmt.Errorf("Database Query (CountUsers): %w", err)
	}

	var userResponses []dto.UserSimplifiedResponse
	for _, user := range users {
		userUUID, _ := uuid.FromBytes(user.ID)
		userResponses = append(userResponses,
			*s.mapToSimplifiedUserResponse(user, userUUID))
	}

	lastPage := (total + limit - 1) / limit
	if lastPage == 0 {
		lastPage = 1
	}

	return &dto.UserSimplifiedResponseList{
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
) (*dto.UserSimplifiedResponseList, error) {
	offset := (page - 1) * limit

	users, err := s.Repo.GetBoundUserList(ctx, limit, offset, userID[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetBound): %w", err)
	}

	total, err := s.Repo.CountBoundUsers(ctx, userID[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (CountBound): %w", err)
	}

	var userResponses []dto.UserSimplifiedResponse
	for _, user := range users {
		userUUID, _ := uuid.FromBytes(user.ID)
		userResponses = append(userResponses,
			*s.mapToSimplifiedUserResponse(user, userUUID))
	}

	lastPage := (total + limit - 1) / limit
	if lastPage == 0 {
		lastPage = 1
	}

	return &dto.UserSimplifiedResponseList{
		Users:       userResponses,
		TotalCount:  total,
		CurrentPage: page,
		LastPage:    lastPage,
	}, nil
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
 * UpdateUserRole modifies association between user and their role.
 */
func (s *userService) UpdateUserRole(
	ctx context.Context,
	id uuid.UUID,
	roleID *int,
	adminID uuid.UUID,
	permissions []string,
) error {
	if slices.Contains(permissions, "Assign Roles") ||
		slices.Contains(permissions, "Remove Roles") {
		var nullRoleID sql.NullInt64
		if roleID != nil {
			nullRoleID = sql.NullInt64{
				Int64: int64(*roleID),
				Valid: true,
			}
		}
		err := s.Repo.UpdateUserRole(ctx, id[:], nullRoleID)
		if err != nil {
			return fmt.Errorf("Database Query (UpdateUserRole): %w", err)
		}
		return nil
	}

	return fmt.Errorf("Permission Validation: unauthorized to update roles")
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

func (s *userService) mapToUserResponse(
	user models.User,
	id uuid.UUID,
) *dto.UserResponse {
	resp := &dto.UserResponse{
		ID:         id.String(),
		FirstName:  user.FirstName,
		MiddleName: user.MiddleName,
		LastName:   user.LastName,
		NameSuffix: user.NameSuffix,
		Email:      user.Email,
		Status:     string(user.Status),
		CreatedAt:  user.CreatedAt.Format(TIME_LAYOUT),
		UpdatedAt:  user.UpdatedAt.Format(TIME_LAYOUT),
	}

	if user.RoleID.Valid {
		resp.Roles = &dto.UserRoleResponse{
			ID:          user.Role.ID,
			RoleName:    user.Role.RoleName,
			Description: user.Role.Description,
		}
	}

	clients := make([]dto.ClientAccessResponse, 0, len(user.AllowedClients))
	for _, client := range user.AllowedClients {
		clientUUID, _ := uuid.FromBytes(client.ID)
		clients = append(clients, dto.ClientAccessResponse{
			ID:   clientUUID.String(),
			Name: client.ClientName,
		})
	}

	resp.Clients = clients

	return resp
}

func (s *userService) mapToSimplifiedUserResponse(
	user models.User,
	id uuid.UUID,
) *dto.UserSimplifiedResponse {
	clients := make([]dto.ClientAccessResponse, 0, len(user.AllowedClients))
	for _, client := range user.AllowedClients {
		clientUUID, _ := uuid.FromBytes(client.ID)
		clients = append(clients, dto.ClientAccessResponse{
			ID:   clientUUID.String(),
			Name: client.ClientName,
		})
	}

	return &dto.UserSimplifiedResponse{
		ID:         id.String(),
		FirstName:  user.FirstName,
		MiddleName: user.MiddleName,
		LastName:   user.LastName,
		NameSuffix: user.NameSuffix,
		Email:      user.Email,
		Status:     string(user.Status),
		CreatedAt:  user.CreatedAt.Format(TIME_LAYOUT),
		UpdatedAt:  user.UpdatedAt.Format(TIME_LAYOUT),
		Clients:    clients,
	}
}

/**
 * GetAdminUserList retrieves a paginated list of users with assigned roles.
 */
func (s *userService) GetAdminUserList(
	ctx context.Context,
	limit,
	page int,
) (*dto.UserResponseList, error) {
	offset := (page - 1) * limit

	users, err := s.Repo.GetAdminUserList(ctx, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetAdminList): %w", err)
	}

	total, err := s.Repo.CountAdminUsers(ctx)
	if err != nil {
		return nil, fmt.Errorf("Database Query (CountAdmins): %w", err)
	}

	var userResponses []dto.UserResponse
	for _, user := range users {
		userUUID, _ := uuid.FromBytes(user.ID)
		userResponses = append(userResponses,
			*s.mapToUserResponse(user, userUUID))
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
