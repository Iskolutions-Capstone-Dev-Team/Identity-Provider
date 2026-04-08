package dto

type OTPRequest struct {
	UserID string `json:"user_id" binding:"required"`
	Email  string `json:"email" binding:"required,email"`
}

type InvitationRequest struct {
	Email          string `json:"email" binding:"required,email"`
	InvitationType string `json:"invitation_type" binding:"required"`
}
