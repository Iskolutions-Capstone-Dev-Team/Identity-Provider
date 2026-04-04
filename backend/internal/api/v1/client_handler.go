package v1

import (
	"log"
	"mime/multipart"
	"net/http"
	"strconv"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Action constants for audit logging
const (
	actionCreateClient = "create_client"
	actionListClients  = "list_clients"
	actionGetClient    = "get_client"
	actionUpdateClient = "update_client"
	actionRotateSecret = "rotate_secret"
	actionDeleteClient = "delete_client"
)

// ClientHandler handles client management HTTP requests.
type ClientHandler struct {
	Service    *service.ClientService
	LogService *service.LogService
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
	if !middleware.HasPermission(c, "Add appclient") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		log.Print("[PostClient] FormFile Extraction: no image")
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "no image"})
		return
	}
	defer file.Close()

	req := dto.CreateClientRequest{
		Name:        c.PostForm("name"),
		BaseURL:     c.PostForm("base_url"),
		RedirectURI: c.PostForm("redirect_uri"),
		LogoutURI:   c.PostForm("logout_uri"),
		Description: c.PostForm("description"),
		Grants:      c.PostFormArray("grants"),
	}

	userID := c.GetString("user_id")
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		log.Printf("[PostClient] UUID Parse: %v", err)
		c.JSON(http.StatusInternalServerError,
			dto.ErrorResponse{Error: "creation failed"})
		return
	}

	ctx := c.Request.Context()
	actorName, _ := h.LogService.GetUserEmail(ctx, userUUID[:])
	if actorName == "" {
		actorName = userID
	}

	metadata := buildMetadata(map[string]interface{}{
		"client_name": req.Name,
		"ip":          c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
	})

	resp, err := h.Service.CreateClient(
		ctx,
		req,
		file,
		header,
		userUUID,
	)
	if err != nil {
		log.Printf("[PostClient] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionCreateClient,
				Target: req.Name,
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"client_name": req.Name,
					"ip":          c.ClientIP(),
					"user_agent":  c.Request.UserAgent(),
					"error":       err.Error(),
				}),
			})
		c.JSON(http.StatusInternalServerError,
			dto.ErrorResponse{Error: "creation failed"})
		return
	}

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
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
	if !middleware.HasPermission(c, "View all appclients") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	keyword := c.Query("keyword")

	role := c.GetString("role")
	uIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(uIDStr)
	if err != nil {
		log.Printf("[GetClientList] UUID Parse: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "identity parse error",
		})
		return
	}

	ctx := c.Request.Context()
	actorName, _ := h.LogService.GetUserEmail(ctx, userID[:])
	if actorName == "" {
		actorName = uIDStr
	}

	metadata := buildMetadata(map[string]interface{}{
		"limit":      limit,
		"page":       page,
		"keyword":    keyword,
		"privilege":  role,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
	})

	resp, err := h.Service.GetFilteredClientList(
		ctx,
		role,
		userID,
		limit,
		page,
		keyword,
	)
	if err != nil {
		log.Printf("[GetClientList] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
			&dto.PostAuditLogRequest{
				Action: actionListClients,
				Target: "client_list",
				Status: models.StatusFail,
				Metadata: buildMetadata(map[string]interface{}{
					"limit":      limit,
					"page":       page,
					"keyword":    keyword,
					"privilege":  role,
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

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
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

	ctx := c.Request.Context()
	clientName := h.LogService.ResolveClientName(ctx, idParam)

	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(ctx, userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	metadata := buildMetadata(map[string]interface{}{
		"client_id":   idParam,
		"client_name": clientName,
		"ip":          c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
	})

	client, err := h.Service.GetClientByID(
		ctx,
		clientUUID,
	)
	if err != nil {
		log.Printf("[GetClient] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
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

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
		&dto.PostAuditLogRequest{
			Action:   actionGetClient,
			Target:   clientName,
			Status:   models.StatusSuccess,
			Metadata: metadata,
		})

	c.JSON(http.StatusOK, gin.H{"client": client})
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
	if !middleware.HasPermission(c, "Edit appclient") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	idParam := c.Param("id")
	clientUUID, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid id"})
		return
	}

	ctx := c.Request.Context()
	clientName := h.LogService.ResolveClientName(ctx, idParam)

	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(ctx, userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	var file multipart.File
	var header *multipart.FileHeader
	f, hder, err := c.Request.FormFile("image")
	if err == nil {
		file = f
		header = hder
		defer file.Close()
	}

	req := dto.CreateClientRequest{
		Name:        c.PostForm("name"),
		BaseURL:     c.PostForm("base_url"),
		RedirectURI: c.PostForm("redirect_uri"),
		LogoutURI:   c.PostForm("logout_uri"),
		Description: c.PostForm("description"),
		Grants:      c.PostFormArray("grants"),
	}

	metadata := buildMetadata(map[string]interface{}{
		"client_id":   idParam,
		"client_name": clientName,
		"ip":          c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
	})

	err = h.Service.UpdateClient(
		ctx,
		clientUUID,
		req,
		file,
		header,
	)
	if err != nil {
		log.Printf("[PutClient] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
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

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
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

	ctx := c.Request.Context()
	clientName := h.LogService.ResolveClientName(ctx, clientIDString)

	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(ctx, userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	metadata := buildMetadata(map[string]interface{}{
		"client_id":   clientIDString,
		"client_name": clientName,
		"ip":          c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
	})

	resp, err := h.Service.RotateClientSecret(
		ctx,
		clientID,
	)
	if err != nil {
		log.Printf("[PatchClientSecret] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
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

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
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
	if !middleware.HasPermission(c, "Delete appclient") {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

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

	ctx := c.Request.Context()
	clientName := h.LogService.ResolveClientName(ctx, idParam)

	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	actorName, _ := h.LogService.GetUserEmail(ctx, userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	metadata := buildMetadata(map[string]interface{}{
		"client_id":   idParam,
		"client_name": clientName,
		"ip":          c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
	})

	err = h.Service.DeleteClient(ctx, clientUUID)
	if err != nil {
		log.Printf("[DeleteClient] %v", err)
		_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
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

	_ = h.LogService.PostAuditLogWithActorString(ctx, actorName,
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
