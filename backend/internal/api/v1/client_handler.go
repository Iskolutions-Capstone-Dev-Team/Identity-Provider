package v1

import (
	"log"
	"mime/multipart"
	"net/http"
	"strconv"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Action constants for audit logging
const (
	actionCreateClient  = "create_client"
	actionListClients   = "list_clients"
	actionGetClient     = "get_client"
	actionGetClientTags = "get_client_tags"
	actionUpdateClient  = "update_client"
	actionRotateSecret  = "rotate_secret"
	actionDeleteClient  = "delete_client"
)

// ClientHandler handles client management HTTP requests.
type ClientHandler struct {
	Service          *service.ClientService
	PrivilegeService *service.PrivilegeService
	LogService       *service.LogService
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
		log.Print("[PostClient] FormFile Extraction: no image")
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

	userID := c.GetString("user_id")
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		log.Printf("[PostClient] UUID Parse: %v", err)
		c.JSON(http.StatusInternalServerError,
			dto.ErrorResponse{Error: "creation failed"})
		return
	}

	// Resolve actor name for audit log
	actorName, _ := h.LogService.GetUserEmail(userUUID[:])
	if actorName == "" {
		actorName = userID // fallback
	}

	// Prepare metadata
	metadata := buildMetadata(map[string]interface{}{
		"client_name": req.Name,
		"tag":         req.Tag,
		"ip":          c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
	})

	resp, err := h.Service.CreateClient(
		c.Request.Context(),
		req,
		file,
		header,
		userUUID,
	)
	if err != nil {
		log.Printf("[PostClient] %v", err)
		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
			&dto.PostAuditLogRequest{
				Action: actionCreateClient,
				Target: req.Name,
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"client_name": req.Name,
					"tag":         req.Tag,
					"ip":          c.ClientIP(),
					"user_agent":  c.Request.UserAgent(),
					"error":       err.Error(),
				}),
			})
		c.JSON(http.StatusInternalServerError,
			dto.ErrorResponse{Error: "creation failed"})
		return
	}

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(actorName,
		&dto.PostAuditLogRequest{
			Action:   actionCreateClient,
			Target:   req.Name,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

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
	if page < 1 {
		page = 1
	}
	keyword := c.Query("keyword")

	// 1. Check Privilege Level
	level, err := h.PrivilegeService.CheckUserPrivilege(c)
	if err != nil {
		log.Printf("[GetClientList] Privilege Validation: %v", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized",
		})
		return
	}

	// 2. Parse User Identity
	uIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(uIDStr)
	if err != nil {
		log.Printf("[GetClientList] UUID Parse: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "identity parse error",
		})
		return
	}

	// Resolve actor name
	actorName, _ := h.LogService.GetUserEmail(userID[:])
	if actorName == "" {
		actorName = uIDStr
	}

	// Prepare metadata
	metadata := buildMetadata(map[string]interface{}{
		"limit":      limit,
		"page":       page,
		"keyword":    keyword,
		"privilege":  level,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	// 3. Delegate to Service
	resp, err := h.Service.GetFilteredClientList(
		c.Request.Context(),
		level,
		userID,
		limit,
		page,
		keyword,
	)
	if err != nil {
		log.Printf("[GetClientList] %v", err)
		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
			&dto.PostAuditLogRequest{
				Action: actionListClients,
				Target: "client_list",
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"limit":      limit,
					"page":       page,
					"keyword":    keyword,
					"privilege":  level,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to retrieve clients",
		})
		return
	}

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(actorName,
		&dto.PostAuditLogRequest{
			Action:   actionListClients,
			Target:   "client_list",
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

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
		log.Printf("[GetClient] UUID Parse: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "invalid uuid format"},
		)
		return
	}

	// Resolve client name for target (optional, can use ID)
	clientName := h.LogService.ResolveClientName(idParam)

	// Get actor
	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr) // ignore error, we'll fallback
	actorName, _ := h.LogService.GetUserEmail(userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	// Metadata
	metadata := buildMetadata(map[string]interface{}{
		"client_id":   idParam,
		"client_name": clientName,
		"ip":          c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
	})

	client, err := h.Service.GetClientByID(
		c.Request.Context(),
		clientUUID,
	)
	if err != nil {
		log.Printf("[GetClient] %v", err)
		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
			&dto.PostAuditLogRequest{
				Action: actionGetClient,
				Target: clientName,
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"client_id":   idParam,
					"client_name": clientName,
					"ip":          c.ClientIP(),
					"user_agent":  c.Request.UserAgent(),
					"error":       err.Error(),
				}),
			})
		c.JSON(
			http.StatusNotFound,
			dto.ErrorResponse{Error: "client not found"},
		)
		return
	}

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(actorName,
		&dto.PostAuditLogRequest{
			Action:   actionGetClient,
			Target:   clientName,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

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
	const defaultLimit = "10"
	const defaultPage = "1"

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	page, _ := strconv.Atoi(c.DefaultQuery("page", defaultPage))
	keyword := c.Query("keyword")

	if page < 1 {
		page = 1
	}

	// 1. Check Privilege Level
	level, err := h.PrivilegeService.CheckUserPrivilege(c)
	if err != nil {
		log.Printf("[GetClientTags] Privilege Validation: %v", err)
		c.JSON(
			http.StatusUnauthorized,
			dto.ErrorResponse{Error: "Unauthorized"},
		)
		return
	}

	// 2. Parse User Identity
	uIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(uIDStr)
	if err != nil {
		log.Printf("[GetClientTags] UUID Parsing: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Identity parse error"},
		)
		return
	}

	// Resolve actor name
	actorName, _ := h.LogService.GetUserEmail(userID[:])
	if actorName == "" {
		actorName = uIDStr
	}

	// Metadata
	metadata := buildMetadata(map[string]interface{}{
		"limit":      limit,
		"page":       page,
		"keyword":    keyword,
		"privilege":  level,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	// 3. Delegate to Service
	resp, err := h.Service.GetFilteredClientTagList(
		c.Request.Context(),
		level,
		userID,
		limit,
		page,
		keyword,
	)
	if err != nil {
		log.Printf("[GetClientTags] Service Execution: %v", err)
		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
			&dto.PostAuditLogRequest{
				Action: actionGetClientTags,
				Target: "client_tags",
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"limit":      limit,
					"page":       page,
					"keyword":    keyword,
					"privilege":  level,
					"ip":         c.ClientIP(),
					"user_agent": c.Request.UserAgent(),
					"error":      err.Error(),
				}),
			})
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Failed to retrieve tags"},
		)
		return
	}

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(actorName,
		&dto.PostAuditLogRequest{
			Action:   actionGetClientTags,
			Target:   "client_tags",
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

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

	// Resolve client name for target
	clientName := h.LogService.ResolveClientName(idParam)

	// Get actor
	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(userID[:])
	if actorName == "" {
		actorName = userIDStr
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

	// Metadata
	metadata := buildMetadata(map[string]interface{}{
		"client_id":   idParam,
		"client_name": clientName,
		"ip":          c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
	})

	err = h.Service.UpdateClient(
		c.Request.Context(),
		clientUUID,
		req,
		file,
		header,
	)
	if err != nil {
		log.Printf("[PutClient] %v", err)
		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
			&dto.PostAuditLogRequest{
				Action: actionUpdateClient,
				Target: clientName,
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"client_id":   idParam,
					"client_name": clientName,
					"ip":          c.ClientIP(),
					"user_agent":  c.Request.UserAgent(),
					"error":       err.Error(),
				}),
			})
		c.JSON(http.StatusInternalServerError,
			dto.ErrorResponse{Error: "update failed"})
		return
	}

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(actorName,
		&dto.PostAuditLogRequest{
			Action:   actionUpdateClient,
			Target:   clientName,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

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
		log.Printf("[PatchClientSecret] UUID Parse: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "invalid client id format"},
		)
		return
	}

	// Resolve client name
	clientName := h.LogService.ResolveClientName(clientIDString)

	// Get actor
	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	// Metadata
	metadata := buildMetadata(map[string]interface{}{
		"client_id":   clientIDString,
		"client_name": clientName,
		"ip":          c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
	})

	resp, err := h.Service.RotateClientSecret(
		c.Request.Context(),
		clientID,
	)
	if err != nil {
		log.Printf("[PatchClientSecret] %v", err)
		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
			&dto.PostAuditLogRequest{
				Action: actionRotateSecret,
				Target: clientName,
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"client_id":   clientIDString,
					"client_name": clientName,
					"ip":          c.ClientIP(),
					"user_agent":  c.Request.UserAgent(),
					"error":       err.Error(),
				}),
			})
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "failed to rotate secret"},
		)
		return
	}

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(actorName,
		&dto.PostAuditLogRequest{
			Action:   actionRotateSecret,
			Target:   clientName,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

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
		log.Printf("[DeleteClient] UUID Parse: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "invalid uuid"},
		)
		return
	}

	// Resolve client name
	clientName := h.LogService.ResolveClientName(idParam)

	// Get actor
	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	// Metadata
	metadata := buildMetadata(map[string]interface{}{
		"client_id":   idParam,
		"client_name": clientName,
		"ip":          c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
	})

	err = h.Service.DeleteClient(c.Request.Context(), clientUUID)
	if err != nil {
		log.Printf("[DeleteClient] %v", err)
		// Log failure
		_ = h.LogService.PostAuditLogWithActorString(actorName,
			&dto.PostAuditLogRequest{
				Action: actionDeleteClient,
				Target: clientName,
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"client_id":   idParam,
					"client_name": clientName,
					"ip":          c.ClientIP(),
					"user_agent":  c.Request.UserAgent(),
					"error":       err.Error(),
				}),
			})
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "failed to deactivate client"},
		)
		return
	}

	// Log success
	_ = h.LogService.PostAuditLogWithActorString(actorName,
		&dto.PostAuditLogRequest{
			Action:   actionDeleteClient,
			Target:   clientName,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "client deactivated successfully",
	})
}
