package v1

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
)

type RoleHandler struct {
	Service    *service.RoleService
	Repo       *repository.RoleRepository
	ClientRepo *repository.ClientRepository
}

// PostRole handles POST /v1/admin/roles
// @Summary Create a new role
// @Description Adds a new global or SP-prefixed role to the system
// @Tags Roles
// @Accept json
// @Produce json
// @Param body body dto.RoleRequest true "Role details"
// @Success 201 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /v1/admin/roles [post]
func (h *RoleHandler) PostRole(c *gin.Context) {
	var req dto.RoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PostRole] Bind JSON: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid request payload"},
		)
		return
	}

	err := h.Service.CreateRole(c.Request.Context(), req)
	if err != nil {
		log.Printf("[PostRole] %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Role creation failed"},
		)
		return
	}

	c.JSON(
		http.StatusCreated,
		dto.SuccessResponse{Message: "Role created successfully"},
	)
}

// GetRoleList handles GET /v1/admin/roles
// @Summary List all roles
// @Description Retrieves a paginated list of non-deleted roles
// @Tags Roles
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Success 200 {object} dto.RoleListResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /v1/admin/roles [get]
func (h *RoleHandler) GetRoleList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}

	resp, err := h.Service.GetRoleList(
		c.Request.Context(),
		service.PAGE_LIMIT,
		page,
	)
	if err != nil {
		log.Printf("[GetRoleList] %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Failed to fetch roles"},
		)
		return
	}

	c.JSON(http.StatusOK, resp)
}

// GetRole handles GET /v1/admin/roles/:id
// @Summary Get role by ID
// @Description Fetches full details of a specific role
// @Tags Roles
// @Accept json
// @Produce json
// @Param id path int true "Role ID"
// @Success 200 {object} dto.RoleResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /v1/admin/roles/{id} [get]
func (h *RoleHandler) GetRole(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("[GetRole] Parse ID: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid ID format"},
		)
		return
	}

	resp, err := h.Service.GetRoleByID(c.Request.Context(), id)
	if err != nil {
		log.Printf("[GetRole] %v", err)
		c.JSON(
			http.StatusNotFound,
			dto.ErrorResponse{Error: "Role not found"},
		)
		return
	}

	c.JSON(http.StatusOK, resp)
}

// GetRolesBySearch retrieves a filtered list of roles by keyword.
// @Summary Search roles by keyword
// @Description Searches for roles matching the provided query parameter.
// @Tags Roles
// @Accept json
// @Produce json
// @Param keyword query string true "Search term for role names"
// @Success 200 {object} dto.RoleListResponse "Success"
// @Failure 404 {object} dto.ErrorResponse
// @Failure 501 {object} dto.ErrorResponse
// @Router /api/roles [get]
func (h *RoleHandler) GetRolesBySearch(c *gin.Context) {
	keyword := c.Query("keyword")

	resp, err := h.Service.SearchRoles(c.Request.Context(), keyword)
	if err != nil {
		log.Printf("[GetRolesBySearch] %v", err)

		// Determine if error is "not found" or a system failure
		status := http.StatusInternalServerError
		msg := "fetching error"

		if strings.Contains(err.Error(), "no records") {
			status = http.StatusNotFound
			msg = "role not found using keyword"
		}

		c.JSON(status, dto.ErrorResponse{Error: msg})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// PutRole handles PUT /v1/admin/roles/:id
// @Summary Update an existing role
// @Description Modifies role name or description
// @Tags Roles
// @Accept json
// @Produce json
// @Param id path int true "Role ID"
// @Param body body dto.RoleRequest true "Updated role data"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /v1/admin/roles/{id} [put]
func (h *RoleHandler) PutRole(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("[PutRole] Parse ID: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid ID format"},
		)
		return
	}

	var req dto.RoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PutRole] Bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	err = h.Service.UpdateRole(c.Request.Context(), id, req)
	if err != nil {
		log.Printf("[PutRole] %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Update failed"},
		)
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Message: "Role updated"})
}

// DeleteRole handles DELETE /v1/admin/roles/:id
// @Summary Soft delete a role
// @Description Marks a role as deleted in the audit trail
// @Tags Roles
// @Param id path int true "Role ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /v1/admin/roles/{id} [delete]
func (h *RoleHandler) DeleteRole(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("[DeleteRole] Parse ID: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{Error: "Invalid ID format"},
		)
		return
	}

	err = h.Service.DeleteRole(c.Request.Context(), id)
	if err != nil {
		log.Printf("[DeleteRole] %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Deletion failed"},
		)
		return
	}

	c.JSON(
		http.StatusOK,
		dto.SuccessResponse{Message: "Role deleted successfully"},
	)
}
