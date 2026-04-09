package dto

type OTPRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type InvitationRequest struct {
	Email          string `json:"email" binding:"required,email"`
	InvitationType string `json:"invitation_type" binding:"required"`
}
