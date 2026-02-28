package v1

import (
	"crypto/rsa"
	"log"
	"net/http"
	"strconv"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/auth"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ClientHandler struct {
	Repo       *repository.ClientRepository
	PrivateKey *rsa.PrivateKey
}

// PostClient handles POST /v1/admin/clients
// @Summary Register a new Service Provider with Icon
// @Description Creates client, saves icon, hashes secret, and maps roles
// @Tags ServiceProviders
// @Accept multipart/form-data
// @Produce json
// @Param name formData string true "Client Name"
// @Param Tag formData string true "Tag"
// @Param description formData string false "Description"
// @Param base_url formData string true "Base URL"
// @Param redirect_uri formData string true "Redirect URI"
// @Param logout_uri formData string true "Logout URI"
// @Param grants formData []string true "Grants (e.g. authorization_code)"
// @Param roles formData []string false "Initial Roles"
// @Param image formData file true "Client Icon"
// @Success 201 {object} dto.MessageResponse
// @Router /v1/admin/clients [post]
func (h *ClientHandler) PostClient(c *gin.Context) {
	file, _ := c.FormFile("image")
	f, _ := file.Open()
	defer f.Close()

	imagePath, err := service.ProcessAndUploadIcon(
		c.Request.Context(),
		c.PostForm("tag"),
		file.Filename,
		f,
		file.Size,
	)
	if err != nil {
		log.Printf("[PostClient] Failed to process image: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "upload failed"},
		)
	}

	clientID := uuid.New()
	rawSecret, _ := auth.GenerateRandomString(32)
	hashedSecret, _ := auth.HashSecret(rawSecret)

	clientModel := &models.Client{
		ID:            clientID[:],
		ClientName:    c.PostForm("name"),
		Tag:           c.PostForm("tag"),
		ClientSecret:  hashedSecret,
		BaseUrl:       c.PostForm("base_url"),
		RedirectUri:   c.PostForm("redirect_uri"),
		LogoutUri:     c.PostForm("logout_uri"),
		Description:   c.PostForm("description"),
		ImageLocation: imagePath,
	}

	grants := c.PostFormArray("grants")
	if err := h.Repo.CreateClient(clientModel, grants); err != nil {
		log.Printf("[PostClient] Creation failed: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "db error"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"client_id":     clientID.String(),
		"client_secret": rawSecret,
		"image_url":     imagePath,
		"message":       "Copy secret now. It is stored as a hash.",
	})
}

// GetClientList handles GET /v1/admin/clients
// @Summary List Service Providers
// @Description Fetch active clients with pagination
// @Tags ServiceProviders
// @Param limit query int false "Pagination Limit" default(10)
// @Param page query int default(1)
// @Success 200 {array} dto.ClientResponse
// @Router /v1/admin/clients [get]
func (h *ClientHandler) GetClientList(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	keyword := c.Query("keyword")

	if page < 1 {
		page = 1
	}
	offset := (page - 1) * PAGE_LIMIT

	total, err := h.Repo.CountClients()
	if err != nil {
		log.Printf("[GetClientList] Count failed: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "count error"})
		return
	}

	clients, err := h.Repo.ListClients(limit, offset, keyword)
	if err != nil {
		log.Printf("[GetClientList] Fetching list failed: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "fetch error"})
		return
	}

	var res []dto.ClientResponse
	for _, cl := range clients {
		id, _ := uuid.FromBytes(cl.ID)
		res = append(res, dto.ClientResponse{
			ID:            id.String(),
			Name:          cl.ClientName,
			Tag:           cl.Tag,
			Description:   cl.Description,
			ImageLocation: cl.ImageLocation,
		})
	}

	lastPage := (total + PAGE_LIMIT - 1) / PAGE_LIMIT
	if lastPage == 0 {
		lastPage = 1
	}

	c.JSON(http.StatusOK, dto.ClientListResponse{
		Clients:     res,
		CurrentPage: page,
		LastPage:    lastPage,
		TotalCount:  total,
	})
}

// GetClient handles GET /v1/admin/clients/:id
// @Summary Get Client Details
// @Description Fetch full details including grants and roles
// @Tags ServiceProviders
// @Param id path string true "Client UUID"
// @Success 200 {object} dto.ClientResponse
// @Router /v1/admin/clients/{id} [get]
func (h *ClientHandler) GetClient(c *gin.Context) {
	idParam := c.Param("id")
	clientUUID, err := uuid.Parse(idParam)
	if err != nil {
		log.Printf("[GetClient] Invalid uuid %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid uuid format"})
		return
	}

	cl, err := h.Repo.GetByID(clientUUID[:])
	if err != nil {
		log.Printf("[GetClient] Client not found %v", err)
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "client not found"})
		return
	}

	grants, _ := h.Repo.GetGrantTypes(cl.ID)
	roles, _ := h.Repo.GetClientRoles(cl.Tag)

	id, _ := uuid.FromBytes(cl.ID)
	c.JSON(http.StatusOK, gin.H{
		"client": dto.ClientResponse{
			ID:            id.String(),
			Name:          cl.ClientName,
			Tag:           cl.Tag,
			Description:   cl.Description,
			ImageLocation: cl.ImageLocation,
			BaseURL:       cl.BaseUrl,
			RedirectURI:   cl.RedirectUri,
			LogoutURI:     cl.LogoutUri,
		},
		"allowed_grants": grants,
		"roles":          roles,
	})
}

// PutClient handles PUT /v1/admin/clients/:id
// @Summary Update Client Info
// @Description Update safe fields (Name, Description, URLs, Image)
// @Tags ServiceProviders
// @Accept json
// @Produce json
// @Param id path string true "Client UUID"
// @Param body body dto.UpdateClientRequest true "Updated Client Data"
// @Success 200 {object} dto.MessageResponse
// @Router /v1/admin/clients/{id} [put]
func (h *ClientHandler) PutClient(c *gin.Context) {
	idParam := c.Param("id")
	clientUUID, _ := uuid.Parse(idParam)
	file, _ := c.FormFile("image")
	f, _ := file.Open()
	defer f.Close()

	client, err := h.Repo.GetByID(clientUUID[:])
	if err != nil {
		log.Printf("[PutClient] Client search failed: %v", err)
		c.JSON(
			http.StatusNotFound,
			dto.ErrorResponse{Error: "client not found"},
		)
	}

	imagePath, err := service.ProcessAndUploadIcon(
		c.Request.Context(),
		client.Tag,
		file.Filename,
		f,
		file.Size,
	)
	if err != nil {
		log.Printf("[PostClient] Failed to process image: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "upload failed"},
		)
	}

	client = &models.Client{
		ID:            clientUUID[:],
		ClientName:    c.PostForm("name"),
		BaseUrl:       c.PostForm("base_url"),
		RedirectUri:   c.PostForm("redirect_uri"),
		LogoutUri:     c.PostForm("logout_uri"),
		Description:   c.PostForm("description"),
		ImageLocation: imagePath,
	}

	if err := h.Repo.UpdateClient(client); err != nil {
		log.Printf("[PutClient] Update failed: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "update fail"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "client updated"})
}

// DeleteClient handles DELETE /v1/admin/clients/:id
// @Summary Soft Delete Client
// @Tags ServiceProviders
// @Param id path string true "Client UUID"
// @Router /v1/admin/clients/{id} [delete]
func (h *ClientHandler) DeleteClient(c *gin.Context) {
	idParam := c.Param("id")
	clientUUID, err := uuid.Parse(idParam)
	if err != nil {
		log.Printf("[DeleteClient] Invalid uuid %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid uuid"})
		return
	}

	if err := h.Repo.SoftDelete(clientUUID[:]); err != nil {
		log.Printf("[DeleteClient] Deletion failed: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "delete fail"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "client deactivated successfully"})
}
