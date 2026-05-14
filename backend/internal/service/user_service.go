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
	CreateAdminUser(ctx context.Context,
		req dto.PostAdminUserRequest) (uuid.UUID, error)
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
	UpdateUserPasswordByEmail(ctx context.Context, email string,
		newPassword string) error
	UpdateUserStatus(ctx context.Context, id uuid.UUID,
		newStatus string) error
	UpdateUserRole(ctx context.Context, id uuid.UUID, roleID *int,
		adminID uuid.UUID, permissions []string) error
	UpdateUserName(ctx context.Context, id uuid.UUID,
		req dto.UpdateUserNameRequest) error
	ChangePassword(ctx context.Context, id uuid.UUID,
		oldPassword, newPassword string) error
	SyncAdminClientAccess(ctx context.Context, id uuid.UUID,
		clientIDs []string) error
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
	var userID uuid.UUID
	var passwordHash string
	var err error

	// Check for existing user (including deleted)
	existingUser, err := s.Repo.GetUserByEmailIncludeDeleted(ctx, req.Email)
	if err != nil {
		return uuid.Nil, fmt.Errorf("pre-create (EmailLookup): %w", err)
	}

	if existingUser != nil {
		if !existingUser.DeletedAt.Valid {
			return uuid.Nil,
				fmt.Errorf("conflict: user with email %s already exists",
				req.Email)
		}

		// Handle re-registration of deleted user
		uID, _ := uuid.FromBytes(existingUser.ID)
		if err = s.Repo.ClearUserRelations(ctx, existingUser.ID); err != nil {
			return uuid.Nil, fmt.Errorf("re-register (Clear): %w", err)
		}
		if err = s.Repo.RestoreUser(ctx, existingUser.ID); err != nil {
			return uuid.Nil, fmt.Errorf("re-register (Restore): %w", err)
		}

		// Update user info
		passwordHash, err = utils.HashSecret(req.Password)
		if err != nil {
			return uuid.Nil, fmt.Errorf("secret hashing: %w", err)
		}
		userToUpdate := models.User{
			ID:           existingUser.ID,
			FirstName:    req.FirstName,
			MiddleName:   req.MiddleName,
			LastName:     req.LastName,
			NameSuffix:   req.NameSuffix,
			PasswordHash: passwordHash,
		}
		if err = s.Repo.UpdateUserName(ctx, &userToUpdate); err != nil {
			return uuid.Nil, fmt.Errorf("re-register (UpdateName): %w", err)
		}
		if err = s.Repo.UpdateUserPassword(ctx, &userToUpdate); err != nil {
			return uuid.Nil, fmt.Errorf("re-register (UpdatePass): %w", err)
		}

		var roleID sql.NullInt64
		if req.RoleID != nil {
			roleID = sql.NullInt64{Int64: int64(*req.RoleID), Valid: true}
		}
		err = s.Repo.UpdateUserRole(ctx, existingUser.ID, roleID)
		if err != nil {
			return uuid.Nil, fmt.Errorf("re-register (UpdateRole): %w", err)
		}

		userID = uID
	} else {
		userID = uuid.New()
		passwordHash, err = utils.HashSecret(req.Password)
		if err != nil {
			return uuid.Nil, fmt.Errorf("secret hashing: %w", err)
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
			return uuid.Nil, fmt.Errorf("database query (CreateUser): %w", err)
		}
	}

	if req.AccountType != "" {
		typeID, err := s.RegRepo.GetAccountTypeIDByName(ctx, req.AccountType)
		if err != nil {
			return userID, fmt.Errorf("post-create (TypeLookup): %w", err)
		}

		clients, err := s.RegRepo.GetClientsByAccountTypeID(ctx, typeID)
		if err != nil {
			return userID, fmt.Errorf("post-create (RegFetch): %w", err)
		}

		if len(clients) > 0 {
			clientIDs := make([][]byte, 0, len(clients))
			for _, c := range clients {
				clientIDs = append(clientIDs, c.ClientID)
			}
			err = s.CAURepo.BatchAssignClientAccess(ctx, userID[:], clientIDs)
			if err != nil {
				return userID, fmt.Errorf("post-create (Assign): %w", err)
			}
		}
	}

	if len(req.AllowedAppClients) > 0 {
		clientIDs := make([][]byte, 0, len(req.AllowedAppClients))
		for _, clientIDStr := range req.AllowedAppClients {
			cid, err := uuid.Parse(clientIDStr)
			if err != nil {
				return userID, fmt.Errorf("post-create (UUID): %w", err)
			}
			clientIDs = append(clientIDs, cid[:])
		}
		err = s.ClientRepo.BatchAdminClientBind(ctx, userID[:], clientIDs)
		if err != nil {
			return userID, fmt.Errorf("post-create (AdminBind): %w", err)
		}
	}

	return userID, nil
}

/**
 * CreateAdminUser handles user registration using a specific account type ID.
 */
func (s *userService) CreateAdminUser(
	ctx context.Context,
	req dto.PostAdminUserRequest,
) (uuid.UUID, error) {
	var userID uuid.UUID
	var passwordHash string
	var err error

	// Check for existing user (including deleted)
	existingUser, err := s.Repo.GetUserByEmailIncludeDeleted(ctx, req.Email)
	if err != nil {
		return uuid.Nil, fmt.Errorf("pre-create (EmailLookup): %w", err)
	}

	if existingUser != nil {
		if !existingUser.DeletedAt.Valid {
			return uuid.Nil, fmt.Errorf("conflict: user with email %s already exists", req.Email)
		}

		// Handle re-registration of deleted user
		uID, _ := uuid.FromBytes(existingUser.ID)
		if err := s.Repo.ClearUserRelations(ctx, existingUser.ID); err != nil {
			return uuid.Nil, fmt.Errorf("re-register (Clear): %w", err)
		}
		if err := s.Repo.RestoreUser(ctx, existingUser.ID); err != nil {
			return uuid.Nil, fmt.Errorf("re-register (Restore): %w", err)
		}

		// Update user info
		passwordHash, err = utils.HashSecret(req.Password)
		if err != nil {
			return uuid.Nil, fmt.Errorf("secret hashing: %w", err)
		}
		userToUpdate := models.User{
			ID:           existingUser.ID,
			FirstName:    req.FirstName,
			MiddleName:   req.MiddleName,
			LastName:     req.LastName,
			NameSuffix:   req.NameSuffix,
			PasswordHash: passwordHash,
		}
		if err = s.Repo.UpdateUserName(ctx, &userToUpdate); err != nil {
			return uuid.Nil, fmt.Errorf("re-register (UpdateName): %w", err)
		}
		if err = s.Repo.UpdateUserPassword(ctx, &userToUpdate); err != nil {
			return uuid.Nil, fmt.Errorf("re-register (UpdatePass): %w", err)
		}

		var roleID sql.NullInt64
		if req.RoleID != nil {
			roleID = sql.NullInt64{Int64: int64(*req.RoleID), Valid: true}
		}
		if err = s.Repo.UpdateUserRole(ctx, existingUser.ID, roleID); err != nil {
			return uuid.Nil, fmt.Errorf("re-register (UpdateRole): %w", err)
		}

		userID = uID
	} else {
		userID = uuid.New()
		passwordHash, err = utils.HashSecret(req.Password)
		if err != nil {
			return uuid.Nil, fmt.Errorf("secret hashing: %w", err)
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
			return uuid.Nil, fmt.Errorf("database query (CreateAdminUser): %w", err)
		}
	}

	if req.AccountTypeID != 0 {
		clients, err := s.RegRepo.GetClientsByAccountTypeID(ctx,
			req.AccountTypeID)
		if err != nil {
			return userID, fmt.Errorf("post-create (RegFetch): %w", err)
		}

		if len(clients) > 0 {
			clientIDs := make([][]byte, 0, len(clients))
			for _, c := range clients {
				clientIDs = append(clientIDs, c.ClientID)
			}
			err = s.CAURepo.BatchAssignClientAccess(ctx, userID[:], clientIDs)
			if err != nil {
				return userID, fmt.Errorf("post-create (Assign): %w", err)
			}
		}
	}

	if len(req.AllowedAppClients) > 0 {
		clientIDs := make([][]byte, 0, len(req.AllowedAppClients))
		for _, clientIDStr := range req.AllowedAppClients {
			cid, err := uuid.Parse(clientIDStr)
			if err != nil {
				return userID, fmt.Errorf("post-create (UUID): %w", err)
			}
			clientIDs = append(clientIDs, cid[:])
		}
		err = s.ClientRepo.BatchAdminClientBind(ctx, userID[:], clientIDs)
		if err != nil {
			return userID, fmt.Errorf("post-create (AdminBind): %w", err)
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
		return nil, fmt.Errorf("database query (GetUserById): %w", err)
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
		return nil, fmt.Errorf("database query (GetUser): %w", err)
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
		return nil, fmt.Errorf("privilege validation: unauthorized level")
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
		return nil, fmt.Errorf("database query (GetUserList): %w", err)
	}

	total, err := s.Repo.CountUsers(ctx)
	if err != nil {
		return nil, fmt.Errorf("database query (CountUsers): %w", err)
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
		return nil, fmt.Errorf("database query (GetBound): %w", err)
	}

	total, err := s.Repo.CountBoundUsers(ctx, userID[:])
	if err != nil {
		return nil, fmt.Errorf("database query (CountBound): %w", err)
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
		return fmt.Errorf("secret hashing: %w", err)
	}

	user := models.User{
		ID:           id[:],
		PasswordHash: passwordHash,
	}

	err = s.Repo.UpdateUserPassword(ctx, &user)
	if err != nil {
		return fmt.Errorf("database query (UpdatePassword): %w", err)
	}

	return nil
}

/**
 * UpdateUserPasswordByEmail finds user by email and updates password.
 */
func (s *userService) UpdateUserPasswordByEmail(
	ctx context.Context,
	email string,
	newPassword string,
) error {
	user, err := s.Repo.GetUserByEmail(ctx, email)
	if err != nil {
		return fmt.Errorf("database query (GetUserByEmail): %w", err)
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}

	userID, _ := uuid.FromBytes(user.ID)
	return s.UpdateUserPassword(ctx, userID, newPassword)
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
		return fmt.Errorf("status validation: %w", err)
	}

	user := models.User{
		ID:     id[:],
		Status: status,
	}

	err = s.Repo.UpdateStatus(ctx, &user)
	if err != nil {
		return fmt.Errorf("database query (UpdateStatus): %w", err)
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
			return fmt.Errorf("database query (UpdateUserRole): %w", err)
		}
		return nil
	}

	return fmt.Errorf("permission validation: unauthorized to update roles")
}

/**
 * UpdateUserName modifies the name fields of a specific user.
 */
func (s *userService) UpdateUserName(
	ctx context.Context,
	id uuid.UUID,
	req dto.UpdateUserNameRequest,
) error {
	user := models.User{
		ID:         id[:],
		FirstName:  req.FirstName,
		MiddleName: req.MiddleName,
		LastName:   req.LastName,
		NameSuffix: req.NameSuffix,
	}

	err := s.Repo.UpdateUserName(ctx, &user)
	if err != nil {
		return fmt.Errorf("database query (UpdateUserName): %w", err)
	}

	return nil
}

/**
 * ChangePassword verifies the old password before applying the new one.
 */
func (s *userService) ChangePassword(
	ctx context.Context,
	id uuid.UUID,
	oldPassword,
	newPassword string,
) error {
	// 1. Get user to retrieve email
	user, err := s.Repo.GetUserById(ctx, id[:])
	if err != nil || user == nil {
		return fmt.Errorf("user identification: not found")
	}

	// 2. Get user data with hash using email
	userData, err := s.Repo.GetUserByEmail(ctx, user.Email)
	if err != nil || userData == nil {
		return fmt.Errorf("user verification: lookup failed")
	}

	// 3. Compare old password
	err = utils.CompareSecret(userData.PasswordHash, oldPassword)
	if err != nil {
		return fmt.Errorf("user verification: invalid credentials")
	}

	// 4. Update with new password
	return s.UpdateUserPassword(ctx, id, newPassword)
}

/**
 * SyncAdminClientAccess handles the synchronization of app-clients managed
 * by an administrator.
 */
func (s *userService) SyncAdminClientAccess(
	ctx context.Context,
	id uuid.UUID,
	clientIDs []string,
) error {
	binaryClientIDs := make([][]byte, 0, len(clientIDs))
	for _, idStr := range clientIDs {
		cid, err := uuid.Parse(idStr)
		if err != nil {
			return fmt.Errorf("sync admin access: invalid client ID %s: %w",
				idStr, err)
		}
		binaryClientIDs = append(binaryClientIDs, cid[:])
	}

	err := s.ClientRepo.SyncAdminClientBind(ctx, id[:], binaryClientIDs)
	if err != nil {
		return fmt.Errorf("sync admin access: database query: %w", err)
	}

	return nil
}

func (s *userService) DeleteUser(ctx context.Context, id uuid.UUID) error {
	if err := s.Repo.SoftDelete(ctx, id[:]); err != nil {
		return fmt.Errorf("database query (SoftDelete): %w", err)
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
	var managed []dto.ClientAccessResponse
	for _, client := range user.ManagedClients {
		clientUUID, _ := uuid.FromBytes(client.ID)
		managed = append(managed, dto.ClientAccessResponse{
			ID:   clientUUID.String(),
			Name: client.ClientName,
		})
	}
	resp.ManagedClients = managed

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
		return nil, fmt.Errorf("database query (GetAdminList): %w", err)
	}

	total, err := s.Repo.CountAdminUsers(ctx)
	if err != nil {
		return nil, fmt.Errorf("database query (CountAdmins): %w", err)
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
