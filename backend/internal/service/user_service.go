package service

import (
	"context"
	"fmt"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/google/uuid"
)

type UserService struct {
	Repo       *repository.UserRepository
	ClientRepo *repository.ClientRepository
}

/**
 * CreateUser handles the business logic for new user
 * registration, including ID generation and password security.
 */
func (s *UserService) CreateUser(
	ctx context.Context,
	req dto.UserRequest,
) (uuid.UUID, error) {
	userID := uuid.New()

	// Securely hash the plain-text password
	passwordHash, err := utils.HashSecret(req.Password)
	if err != nil {
		return uuid.Nil, fmt.Errorf("Secret Hashing: %w", err)
	}

	user := models.User{
		ID:           userID[:],
		Username:     req.Username,
		FirstName:    req.FirstName,
		MiddleName:   req.MiddleName,
		LastName:     req.LastName,
		Email:        req.Email,
		PasswordHash: passwordHash,
		Status:       models.StatusActive,
		RoleString:   req.Roles,
	}

	err = s.Repo.CreateUser(&user)
	if err != nil {
		return uuid.Nil, fmt.Errorf("Database Query (CreateUser): %w", err)
	}

	return userID, nil
}

func (s *UserService) Register(
	ctx context.Context,
	req dto.PostRegisterRequest,
) (dto.RegisterResponse, error) {
	userID := uuid.New()
	var response dto.RegisterResponse
	baseRedirectUrl := os.Getenv("CLIENT_BASE_URL")

	// Securely hash the plain-text password
	passwordHash, err := utils.HashSecret(req.Password)
	if err != nil {
		return response, fmt.Errorf("Secret Hashing: %w", err)
	}
	roles := make([]string, 0)
	if req.Role == APPLICANT {
		roles = append(roles, APPLICANT_ROLE)
		client, err := s.ClientRepo.GetByTag("PUPTAS")
		if err != nil {
			return response, err
		}
		clientID, _ := uuid.ParseBytes(client.ID)
		response.RedirectURL = fmt.Sprintf(
			"%s/login?client_id=%s", 
			baseRedirectUrl,
			clientID.String(),
		)
	}

	user := models.User{
		ID:           userID[:],
		FirstName:    req.FirstName,
		MiddleName:   req.MiddleName,
		LastName:     req.LastName,
		Email:        req.Email,
		PasswordHash: passwordHash,
		Status:       models.StatusActive,
		RoleString:   roles,
	}

	err = s.Repo.CreateUser(&user)
	if err != nil {
		return response, fmt.Errorf("Database Query (CreateUser): %w", err)
	}
	response.Email = req.Email
	response.UserID = userID.String()
	
	return response, nil
}

/**
 * GetUserByID retrieves a single user by their UUID and
 * formats the record into a response DTO.
 */
func (s *UserService) GetUserByID(
	ctx context.Context,
	id uuid.UUID,
) (*dto.UserResponse, error) {
	user, err := s.Repo.GetUserById(id[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetUserById): %w", err)
	}

	return &dto.UserResponse{
		ID:         id.String(),
		Username:   user.Username,
		FirstName:  user.FirstName,
		MiddleName: user.MiddleName,
		LastName:   user.LastName,
		Email:      user.Email,
		Status:     string(user.Status),
		CreatedAt:  user.CreatedAt.Format(TIME_LAYOUT),
		UpdatedAt:  user.UpdatedAt.Format(TIME_LAYOUT),
	}, nil
}

/**
 * GetMe retrieves profile information for the authenticated
 * user, filtered by the roles allowed for the specific client.
 */
func (s *UserService) GetMe(
	ctx context.Context,
	userID,
	clientID uuid.UUID,
) (*dto.UserInfoResponse, error) {
	user, err := s.Repo.GetUserById(userID[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetUser): %w", err)
	}

	allowedRoles, err := s.ClientRepo.GetClientAllowedRoles(clientID[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetAllowedRoles): %w", err)
	}

	// Create a map for O(1) role lookup
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
		Email:      user.Email,
		Roles:      roleStrings,
	}, nil
}

/**
 * GetFilteredUserList routes the request to fetch either all
 * users or bound users based on the admin's privilege level.
 * @param ctx Request context
 * @param level Admin's privilege level
 * @param userID Admin's UUID
 * @param limit Items per page
 * @param page Current page number
 * @return Paginated user list response or error
 */
func (s *UserService) GetFilteredUserList(
	ctx context.Context,
	role string,
	userID uuid.UUID,
	limit,
	page int,
) (*dto.UserResponseList, error) {
	// SuperAdmin sees all users
	if role == SUPERADMIN {
		return s.GetUserList(ctx, limit, page)
	}

	// Regular Admin only sees users bound to their allowed clients
	if role == ADMIN {
		return s.GetBoundUserList(ctx, limit, page, userID)
	}

	return nil, fmt.Errorf("Privilege Validation: unauthorized level")
}

/**
 * GetUserList retrieves a paginated list of all users and their
 * assigned roles, calculating metadata for the response.
 * @param ctx Request context
 * @param limit Items per page
 * @param page Current page number
 * @return Paginated user list response or error
 */
func (s *UserService) GetUserList(
	ctx context.Context,
	limit,
	page int,
) (*dto.UserResponseList, error) {
	offset := (page - 1) * limit

	users, err := s.Repo.GetUserList(limit, offset)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetUserList): %w", err)
	}

	total, err := s.Repo.CountUsers()
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
			Username:   user.Username,
			FirstName:  user.FirstName,
			MiddleName: user.MiddleName,
			LastName:   user.LastName,
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
 * GetBoundUserList retrieves a paginated list of users that
 * share allowed client roles with the specified admin.
 * @param ctx Request context
 * @param limit Items per page
 * @param page Current page number
 * @param userID The ID of the admin making the request
 * @return Paginated user list response or error
 */
func (s *UserService) GetBoundUserList(
	ctx context.Context,
	limit,
	page int,
	userID uuid.UUID,
) (*dto.UserResponseList, error) {
	offset := (page - 1) * limit

	users, err := s.Repo.GetBoundUserList(limit, offset, userID[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetBound): %w", err)
	}

	total, err := s.Repo.CountBoundUsers(userID[:])
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
			Username:   user.Username,
			FirstName:  user.FirstName,
			MiddleName: user.MiddleName,
			LastName:   user.LastName,
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
 * UpdateUserPassword handles the secure hashing and persistence of
 * a user's new password.
 */
func (s *UserService) UpdateUserPassword(
	ctx context.Context,
	id uuid.UUID,
	newPassword string,
) error {
	// 1. Secure Hashing
	passwordHash, err := utils.HashSecret(newPassword)
	if err != nil {
		return fmt.Errorf("Secret Hashing: %w", err)
	}

	user := models.User{
		ID:           id[:],
		PasswordHash: passwordHash,
	}

	// 2. Persistence
	err = s.Repo.UpdateUserPassword(&user)
	if err != nil {
		return fmt.Errorf("Database Query (UpdatePassword): %w", err)
	}

	return nil
}

/**
 * UpdateUserStatus modifies the operational status of a user
 * after validating the state transition.
 */
func (s *UserService) UpdateUserStatus(
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

	err = s.Repo.UpdateStatus(&user)
	if err != nil {
		return fmt.Errorf("Database Query (UpdateStatus): %w", err)
	}

	return nil
}

/**
 * UpdateUserRoles modifies the associations between a user
 * and their assigned roles in the system.
 */
func (s *UserService) UpdateUserRoles(
	ctx context.Context,
	id uuid.UUID,
	roleIDs []int,
	adminID uuid.UUID,
	role string,
) error {
	if role == SUPERADMIN {
		err := s.Repo.UpdateUserRoles(id[:], roleIDs)
		if err != nil {
			return fmt.Errorf("Database Query (UpdateUserRoles): %w", err)
		}
	}
	if role == ADMIN {
		err := s.Repo.UpdateFilteredRoles(adminID[:], id[:], roleIDs)
		if err != nil {
			return fmt.Errorf("Database Query: (UpdateFilteredRoles): %v", err)
		}
	}

	return nil
}

/**
 * DeleteUser performs a soft-delete on a user record, marking
 * them as inactive without removing the data from the database.
 */
func (s *UserService) DeleteUser(ctx context.Context, id uuid.UUID) error {
	if err := s.Repo.SoftDelete(id[:]); err != nil {
		return fmt.Errorf("Database Query (SoftDelete): %w", err)
	}

	return nil
}
