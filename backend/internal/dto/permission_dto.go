package dto

type PermissionResponse struct {
	ID         int    `json:"id"`
	Permission string `json:"permission"`
}

type UserPermissionsResponse struct {
	Permissions []string `json:"permissions"`
}
