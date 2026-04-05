package dto

// UserRequest handles the incoming data for creating or updating a user.
type UserRequest struct {
	FirstName  string   `json:"first_name" binding:"required"`
	MiddleName string   `json:"middle_name"`
	LastName   string   `json:"last_name" binding:"required"`
	NameSuffix string   `json:"name_suffix"`
	Email      string   `json:"email" binding:"required,email"`
	Password   string   `json:"password" binding:"required,min=8"`
	Status     string   `json:"status" binding:"required"`
	RoleID     *int     `json:"role_id"`
}

// UpdatePasswordRequest handles incoming patch data for updating password
type UpdatePasswordRequest struct {
	NewPassword string `json:"new_password" binding:"required"`
}

// UpdateStatusRequest handles patch data for updating user status
type UpdateStatusRequest struct {
	NewStatus string `json:"new_status" binding:"required"`
}

type UpdateUserRoleRequest struct {
	RoleID *int `json:"role_id"`
}

// UserResponse provides a safe view of user data, hiding the password hash.
type UserResponse struct {
	ID         string             `json:"id"`
	FirstName  string             `json:"first_name"`
	MiddleName string             `json:"middle_name"`
	LastName   string             `json:"last_name"`
	NameSuffix string             `json:"name_suffix"`
	Email      string             `json:"email"`
	Status     string             `json:"status"`
	CreatedAt  string             `json:"created_at"`
	UpdatedAt  string             `json:"updated_at"`
	Roles      *UserRoleRepsonse `json:"roles,omitempty"`
}

// UserResponseList follows the same pagination pattern as Roles and Clients.
type UserResponseList struct {
	Users       []UserResponse `json:"users"`
	TotalCount  int            `json:"total_count"`
	CurrentPage int            `json:"current_page"`
	LastPage    int            `json:"last_page"`
}

// UserStatusUpdate handles administrative status changes (Active/Inactive).
type UserStatusUpdate struct {
	Status string `json:"status" binding:"required,oneof=active inactive"`
}

type UserInfoResponse struct {
	ID         string   `json:"id"`
	FirstName  string   `json:"first_name"`
	MiddleName string   `json:"middle_name"`
	LastName   string   `json:"last_name"`
	NameSuffix string   `json:"name_suffix"`
	Email      string   `json:"email"`
	Roles      string   `json:"roles"`
}
