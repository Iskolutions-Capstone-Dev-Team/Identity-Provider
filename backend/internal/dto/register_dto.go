package dto

// PostRegisterRequest represents the payload for user registration.
type PostRegisterRequest struct {
	FirstName  string `json:"first_name" binding:"required,min=2,max=50"`
	MiddleName string `json:"middle_name" binding:"omitempty,max=50"`
	LastName   string `json:"last_name" binding:"required,min=2,max=50"`
	Email      string `json:"email" binding:"required,email"`
	Role       string `json:"role" binding:"required,oneof=applicant student guest"`
	Password   string `json:"password" binding:"required,min=8,max=72"`
}

// RegisterResponse is the data returned after a successful registration.
type RegisterResponse struct {
	UserID      string `json:"user_id"`
	Email       string `json:"email"`
	RedirectURL string `json:"redirect_url"`
}
