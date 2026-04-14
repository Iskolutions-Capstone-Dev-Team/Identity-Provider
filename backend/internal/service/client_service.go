package service

import (
	"context"
	"fmt"
	"log"
	"mime/multipart"
	"slices"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/storage"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/google/uuid"
)

type ClientService interface {
	CreateClient(ctx context.Context, req dto.CreateClientRequest,
		image multipart.File, imageHeader *multipart.FileHeader,
		userID uuid.UUID) (*dto.ClientSecretResponse, error)
	GetFilteredClientList(ctx context.Context, permissions []string, 
		userID uuid.UUID, limit, page int, 
		keyword string) (*dto.ClientListResponse, error)
	GetClientList(ctx context.Context, limit, page int,
		keyword string) (*dto.ClientListResponse, error)
	GetBoundClients(ctx context.Context, userID uuid.UUID, limit, page int,
		keyword string) (*dto.ClientListResponse, error)
	GetClientByID(ctx context.Context, id uuid.UUID,
		userID uuid.UUID, permissions []string) (*dto.ClientResponse, error)
	UpdateClient(ctx context.Context, id uuid.UUID, req dto.CreateClientRequest,
		file multipart.File, header *multipart.FileHeader,
		userID uuid.UUID, permissions []string) error
	RotateClientSecret(ctx context.Context, id uuid.UUID,
		userID uuid.UUID, permissions []string) (*dto.ClientSecretResponse, error)
	DeleteClient(ctx context.Context, id uuid.UUID,
		userID uuid.UUID, permissions []string) error
}

type clientService struct {
	Repo    repository.ClientRepository
	Storage *storage.S3Provider
}

func NewClientService(repo repository.ClientRepository,
	storage *storage.S3Provider,
) ClientService {
	return &clientService{
		Repo:    repo,
		Storage: storage,
	}
}

/**
 * CreateClient handles business logic for client registration
 * including secret hashing and data persistence.
 */
func (s *clientService) CreateClient(
	ctx context.Context,
	req dto.CreateClientRequest,
	image multipart.File,
	imageHeader *multipart.FileHeader,
	userID uuid.UUID,
) (*dto.ClientSecretResponse, error) {
	// 1. Process and Upload Image
	imagePath, err := ProcessAndUploadIcon(
		ctx,
		imageHeader.Filename,
		image,
		imageHeader.Size,
		s.Storage,
	)
	if err != nil {
		return nil, fmt.Errorf("Storage Upload: %w", err)
	}

	// 2. Security & ID Generation
	clientID := uuid.New()
	rawSecret, _ := utils.GenerateRandomString(32)
	hashedSecret, _ := utils.HashSecret(rawSecret)

	// 3. Model Mapping
	clientModel := &models.Client{
		ID:            clientID[:],
		ClientName:    req.Name,
		ClientSecret:  hashedSecret,
		BaseUrl:       req.BaseURL,
		RedirectUri:   req.RedirectURI,
		LogoutUri:     req.LogoutURI,
		Description:   req.Description,
		ImageLocation: imagePath,
	}

	// 4. Persistence
	err = s.Repo.CreateClient(ctx, clientModel, req.Grants, userID[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (Create): %w", err)
	}

	return &dto.ClientSecretResponse{
		ID:           clientID.String(),
		ClientSecret: rawSecret,
		Message:      "Keep this secret safe; it won't be shown again.",
	}, nil
}

/**
 * GetFilteredClientList routes the request to either a full
 * list or a bound list based on the user's privilege level.
 */
func (s *clientService) GetFilteredClientList(
	ctx context.Context,
	permissions []string,
	userID uuid.UUID,
	limit,
	page int,
	keyword string,
) (*dto.ClientListResponse, error) {
	if slices.Contains(permissions, "View all appclients") {
		return s.GetClientList(ctx, limit, page, keyword)
	}

	if slices.Contains(permissions, "View connected appclients") {
		return s.GetBoundClients(ctx, userID, limit, page, keyword)
	}

	return nil, fmt.Errorf("Privilege Validation: restricted level")
}

func (s *clientService) checkClientAccess(
	ctx context.Context,
	userID uuid.UUID,
	clientID uuid.UUID,
	permissions []string,
) error {
	// If global admin permission is present, skip check.
	if slices.Contains(permissions, "View all appclients") {
		return nil
	}

	// If scoped permission is present, enforce check.
	if slices.Contains(permissions, "View connected appclients") {
		allowed, err := s.Repo.IsClientAllowed(ctx, userID[:], clientID[:])
		if err != nil {
			return fmt.Errorf("Repository Check: %w", err)
		}
		if !allowed {
			return fmt.Errorf("Authorization: client is outside of your scope")
		}
		return nil
	}

	// Default: if no scoping rule is activated, default to global behavior.
	return nil
}

/**
 * GetClientList retrieves a paginated list of clients,
 * calculates metadata, and generates presigned URLs for icons.
 */
func (s *clientService) GetClientList(
	ctx context.Context,
	limit,
	page int,
	keyword string,
) (*dto.ClientListResponse, error) {
	offset := (page - 1) * limit

	total, err := s.Repo.CountClients(ctx, keyword)
	if err != nil {
		return nil, fmt.Errorf("Database Query (Count): %w", err)
	}

	clients, err := s.Repo.ListClients(ctx, limit, offset, keyword)
	if err != nil {
		return nil, fmt.Errorf("Database Query (List): %w", err)
	}

	var res []dto.ClientResponse
	for _, cl := range clients {
		id, _ := uuid.FromBytes(cl.ID)

		// Fetching presigned URL via storage provider
		imgUrl, err := GetPresignedURL(
			ctx,
			cl.ImageLocation,
			s.Storage,
		)
		if err != nil {
			log.Printf("[GetClientListService]: failed to fetch url: %v", err)
		}

		res = append(res, dto.ClientResponse{
			ID:            id.String(),
			Name:          cl.ClientName,
			Description:   cl.Description,
			ImageLocation: imgUrl,
			BaseURL:       cl.BaseUrl,
			RedirectURI:   cl.RedirectUri,
			LogoutURI:     cl.LogoutUri,
			CreatedAt:     cl.CreatedAt.Format(TIME_LAYOUT),
		})
	}

	lastPage := (total + limit - 1) / limit
	if lastPage == 0 {
		lastPage = 1
	}

	return &dto.ClientListResponse{
		Clients:     res,
		CurrentPage: page,
		LastPage:    lastPage,
		TotalCount:  total,
	}, nil
}

/**
 * GetBoundClients retrieves clients associated with a specific
 * administrator, supporting keyword search and pagination.
 */
func (s *clientService) GetBoundClients(
	ctx context.Context,
	userID uuid.UUID,
	limit,
	page int,
	keyword string,
) (*dto.ClientListResponse, error) {
	offset := (page - 1) * limit

	clients, err := s.Repo.ListBoundClients(
		ctx,
		limit,
		offset,
		keyword,
		userID[:],
	)
	if err != nil {
		return nil, fmt.Errorf("Database Query (ListBound): %w", err)
	}

	total, err := s.Repo.CountBoundClients(ctx, keyword, userID[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (CountBound): %v", err)
	}

	var res []dto.ClientResponse
	for _, cl := range clients {
		id, _ := uuid.FromBytes(cl.ID)
		imgURL, _ := GetPresignedURL(ctx, cl.ImageLocation, s.Storage)

		res = append(res, dto.ClientResponse{
			ID:            id.String(),
			Name:          cl.ClientName,
			Description:   cl.Description,
			ImageLocation: imgURL,
			BaseURL:       cl.BaseUrl,
			RedirectURI:   cl.RedirectUri,
			LogoutURI:     cl.LogoutUri,
			CreatedAt:     cl.CreatedAt.Format(TIME_LAYOUT),
		})
	}

	return &dto.ClientListResponse{
		Clients:     res,
		CurrentPage: page,
		TotalCount:  total,
	}, nil
}

/**
 * GetClientByID fetches a complete client profile including
 * grants, roles, and presigned image URLs.
 */
func (s *clientService) GetClientByID(
	ctx context.Context,
	id uuid.UUID,
	userID uuid.UUID,
	permissions []string,
) (*dto.ClientResponse, error) {
	if err := s.checkClientAccess(ctx, userID, id, permissions); err != nil {
		return nil, err
	}

	cl, err := s.Repo.GetByID(ctx, id[:])
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetByID): %w", err)
	}

	// Fetch associated data
	grants, _ := s.Repo.GetGrantTypes(ctx, cl.ID)
	roles, err := s.Repo.GetClientAllowedRoles(ctx, cl.ID)
	if err != nil {
		return nil, fmt.Errorf("Database Query (GetRoles): %w", err)
	}

	// Process image
	imgUrl, _ := GetPresignedURL(
		ctx,
		cl.ImageLocation,
		s.Storage,
	)

	// Map roles to DTO
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

	return &dto.ClientResponse{
		ID:            id.String(),
		Name:          cl.ClientName,
		Description:   cl.Description,
		ImageLocation: imgUrl,
		BaseURL:       cl.BaseUrl,
		RedirectURI:   cl.RedirectUri,
		LogoutURI:     cl.LogoutUri,
		Grants:        grants,
		AllowedRoles:  roleResponses,
	}, nil
}

/**
 * UpdateClient handles the business logic for modifying an
 * existing client, including optional image replacement.
 */
func (s *clientService) UpdateClient(
	ctx context.Context,
	id uuid.UUID,
	req dto.CreateClientRequest,
	file multipart.File,
	header *multipart.FileHeader,
	userID uuid.UUID,
	permissions []string,
) error {
	if err := s.checkClientAccess(ctx, userID, id, permissions); err != nil {
		return err
	}

	existing, err := s.Repo.GetByID(ctx, id[:])
	if err != nil {
		return fmt.Errorf("Database Query (Search): %w", err)
	}

	imagePath := existing.ImageLocation
	if file != nil && header != nil {
		newPath, err := ProcessAndUploadIcon(
			ctx,
			header.Filename,
			file,
			header.Size,
			s.Storage,
		)
		if err != nil {
			return fmt.Errorf("Storage Upload: %w", err)
		}
		imagePath = newPath
	}

	clientModel := &models.Client{
		ID:            id[:],
		ClientName:    req.Name,
		BaseUrl:       req.BaseURL,
		RedirectUri:   req.RedirectURI,
		LogoutUri:     req.LogoutURI,
		Description:   req.Description,
		ImageLocation: imagePath,
	}

	err = s.Repo.UpdateClient(ctx, clientModel, req.Grants)
	if err != nil {
		return fmt.Errorf("Database Query (Update): %w", err)
	}

	return nil
}

/**
 * RotateClientSecret generates a new 32-character secret,
 * hashes it, and updates the client record.
 */
func (s *clientService) RotateClientSecret(
	ctx context.Context,
	id uuid.UUID,
	userID uuid.UUID,
	permissions []string,
) (*dto.ClientSecretResponse, error) {
	if err := s.checkClientAccess(ctx, userID, id, permissions); err != nil {
		return nil, err
	}

	// 1. Generate High-Entropy Secret
	newSecret, err := utils.GenerateRandomString(SECRET_ENTROPY)
	if err != nil {
		return nil, fmt.Errorf("Secret Generation: %w", err)
	}

	// 2. Secure Hashing
	newSecretHash, err := utils.HashSecret(newSecret)
	if err != nil {
		return nil, fmt.Errorf("Secret Hashing: %w", err)
	}

	// 3. Persistence
	err = s.Repo.ChangeSecret(ctx, id[:], newSecretHash)
	if err != nil {
		return nil, fmt.Errorf("Database Query (ChangeSecret): %w", err)
	}

	return &dto.ClientSecretResponse{
		ID:           id.String(),
		ClientSecret: newSecret,
		Message:      "New secret generated. Please store it securely.",
	}, nil
}

/**
 * DeleteClient deactivates a client by removing its storage
 * assets and soft-deleting its database records.
 */
func (s *clientService) DeleteClient(
	ctx context.Context,
	id uuid.UUID,
	userID uuid.UUID,
	permissions []string,
) error {
	if err := s.checkClientAccess(ctx, userID, id, permissions); err != nil {
		return err
	}

	cl, err := s.Repo.GetByID(ctx, id[:])
	if err != nil {
		return fmt.Errorf("Database Query (Search): %w", err)
	}

	// 1. Cleanup Cloud Storage
	err = DeleteImage(ctx, cl.ImageLocation, s.Storage)
	if err != nil {
		return fmt.Errorf("Storage Delete: %w", err)
	}

	// 2. Soft Delete Client Record
	if err := s.Repo.SoftDelete(ctx, id[:]); err != nil {
		return fmt.Errorf("Database Query (SoftDelete): %w", err)
	}

	return nil
}
