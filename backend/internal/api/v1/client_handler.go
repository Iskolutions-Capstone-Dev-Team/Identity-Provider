package v1

import (
	"log"
	"mime/multipart"
	"net/http"
	"strconv"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ClientHandler struct {
	Service *service.ClientService
}

// PostClient handles POST /v1/admin/clients
// @Summary Register a new Service Provider with Icon
// @Description Creates client, saves icon, hashes secret, and maps roles
// @Tags Clients
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
// @Success 201 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /v1/admin/clients [post]
func (h *ClientHandler) PostClient(c *gin.Context) {
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "no image"})
		return
	}
	defer file.Close()

	roles := c.PostFormArray("roles")
	roleIDs := make([]int, 0, len(roles))
	for _, r := range roles {
		id, _ := strconv.Atoi(r)
		roleIDs = append(roleIDs, id)
	}

	req := dto.CreateClientRequest{
		Name:        c.PostForm("name"),
		Tag:         c.PostForm("tag"),
		BaseURL:     c.PostForm("base_url"),
		RedirectURI: c.PostForm("redirect_uri"),
		LogoutURI:   c.PostForm("logout_uri"),
		Description: c.PostForm("description"),
		Grants:      c.PostFormArray("grants"),
		RoleIDs:     roleIDs,
	}

	resp, err := h.Service.CreateClient(
		c.Request.Context(),
		req,
		file,
		header,
	)
	if err != nil {
		log.Printf("[PostClient] %v", err)
		c.JSON(http.StatusInternalServerError,
			dto.ErrorResponse{Error: "creation failed"})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

// GetClientList handles GET /v1/admin/clients
// @Summary List Service Providers
// @Description Fetch active clients with pagination
// @Tags Clients
// @Param limit query int false "Pagination Limit" default(10)
// @Success 200 {array} dto.ClientResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /v1/admin/clients [get]
func (h *ClientHandler) GetClientList(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	keyword := c.Query("keyword")

	if page < 1 {
		page = 1
	}

	resp, err := h.Service.GetClientList(
		c.Request.Context(),
		limit,
		page,
		keyword,
	)
	if err != nil {
		log.Printf("[GetClientList] %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Failed to retrieve clients"},
		)
		return
	}

	c.JSON(http.StatusOK, resp)
}

// GetClient handles GET /v1/admin/clients/:id
// @Summary Get Client Details
// @Description Fetch full details including grants and roles
// @Tags Clients
// @Param id path string true "Client UUID"
// @Success 200 {object} dto.ClientResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /v1/admin/clients/{id} [get]
func (h *ClientHandler) GetClient(c *gin.Context) {
	idParam := c.Param("id")
	clientUUID, err := uuid.Parse(idParam)
	if err != nil {
		log.Printf("[GetClient] %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "invalid uuid format"},
		)
		return
	}

	client, err := h.Service.GetClientByID(
		c.Request.Context(),
		clientUUID,
	)
	if err != nil {
		log.Printf("[GetClient] %v", err)
		// Specific error handling for Not Found could be added here
		c.JSON(
			http.StatusNotFound,
			dto.ErrorResponse{Error: "client not found"},
		)
		return
	}

	c.JSON(http.StatusOK, gin.H{"client": client})
}

// GetClientTags retrieves a paginated list of client tags.
// @Summary Get client tags
// @Description Fetches tags based on limit, page, and keyword filters.
// @Tags Clients
// @Accept json
// @Produce json
// @Param limit query int false "Items per page" default(10)
// @Param page query int false "Page number" default(1)
// @Param keyword query string false "Search keyword"
// @Success 200 {object} dto.ClientListResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /clients/tags [get]
func (h *ClientHandler) GetClientTags(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	keyword := c.Query("keyword")

	if page < 1 {
		page = 1
	}

	resp, err := h.Service.GetClientTags(
		c.Request.Context(),
		limit,
		page,
		keyword,
	)
	if err != nil {
		log.Printf("[GetClientTags] %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Failed to retrieve tags"},
		)
		return
	}

	c.JSON(http.StatusOK, resp)
}

// PutClient handles PUT /v1/admin/clients/:id
// @Summary Update Client Info
// @Description Update safe fields (Name, Description, URLs, Image)
// @Tags Clients
// @Accept json
// @Produce json
// @Param id path string true "Client UUID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /v1/admin/clients/{id} [put]
func (h *ClientHandler) PutClient(c *gin.Context) {
	idParam := c.Param("id")
	clientUUID, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid id"})
		return
	}

	// Optional file handling
	var file multipart.File
	var header *multipart.FileHeader
	f, hder, err := c.Request.FormFile("image")
	if err == nil {
		file = f
		header = hder
		defer file.Close()
	}

	roles := c.PostFormArray("roles")
	roleIDs := make([]int, 0, len(roles))
	for _, r := range roles {
		id, _ := strconv.Atoi(r)
		roleIDs = append(roleIDs, id)
	}

	req := dto.CreateClientRequest{
		Name:        c.PostForm("name"),
		BaseURL:     c.PostForm("base_url"),
		RedirectURI: c.PostForm("redirect_uri"),
		LogoutURI:   c.PostForm("logout_uri"),
		Description: c.PostForm("description"),
		Grants:      c.PostFormArray("grants"),
		RoleIDs:     roleIDs,
	}

	err = h.Service.UpdateClient(
		c.Request.Context(),
		clientUUID,
		req,
		file,
		header,
	)
	if err != nil {
		log.Printf("[PutClient] %v", err)
		c.JSON(http.StatusInternalServerError,
			dto.ErrorResponse{Error: "update failed"})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Message: "client updated"})
}

// PatchClientSecret rotates or updates the client secret for an application.
// @Summary Update client secret
// @Description Updates the secret key associated with a specific client ID.
// @Tags Clients
// @Accept json
// @Produce json
// @Param id path string true "Client ID"
// @Success 200 {object} dto.ClientSecretResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /clients/{id}/secret [patch]
func (h *ClientHandler) PatchClientSecret(c *gin.Context) {
	clientIDString := c.Param("id")
	clientID, err := uuid.Parse(clientIDString)
	if err != nil {
		log.Printf("[PatchClientSecret] %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "invalid client id format"},
		)
		return
	}

	resp, err := h.Service.RotateClientSecret(
		c.Request.Context(),
		clientID,
	)
	if err != nil {
		log.Printf("[PatchClientSecret] %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "failed to rotate secret"},
		)
		return
	}

	c.JSON(http.StatusOK, resp)
}

// DeleteClient handles DELETE /v1/admin/clients/:id
// @Summary Soft Delete Client
// @Tags Clients
// @Param id path string true "Client UUID"
// @Failure 200 {object} dto.ErrorResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /v1/admin/clients/{id} [delete]
func (h *ClientHandler) DeleteClient(c *gin.Context) {
	idParam := c.Param("id")
	clientUUID, err := uuid.Parse(idParam)
	if err != nil {
		log.Printf("[DeleteClient] %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "invalid uuid"},
		)
		return
	}

	err = h.Service.DeleteClient(c.Request.Context(), clientUUID)
	if err != nil {
		log.Printf("[DeleteClient] %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "failed to deactivate client"},
		)
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "client deactivated successfully",
	})
}
