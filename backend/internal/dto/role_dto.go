package dto

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"

type RoleRequest struct {
	RoleName      string `json:"role_name"`
	Description   string `json:"description"`
	PermissionIDs []int  `json:"permission_ids"`
}

type RoleResponse struct {
	ID          int                 `json:"id"`
	RoleName    string              `json:"role_name"`
	Description string              `json:"description"`
	CreatedAt   string              `json:"created_at"`
	UpdatedAt   string              `json:"updated_at"`
	Permissions []models.Permission `json:"permissions"`

	CanDelete bool `json:"can_delete"`
	CanEdit   bool `json:"can_edit"`
}

type UserRoleRepsonse struct {
	ID          int    `json:"id"`
	RoleName    string `json:"role_name"`
	Description string `json:"description"`
}

type RoleListResponse struct {
	Roles       []RoleResponse `json:"roles"`
	TotalCount  int            `json:"total_count"`
	CurrentPage int            `json:"current_page"`
	LastPage    int            `json:"last_page"`
}
