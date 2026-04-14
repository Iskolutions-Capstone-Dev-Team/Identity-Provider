package dto

type OTPRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type InvitationRequest struct {
	Email         string `json:"email" binding:"required,email"`
	AccountTypeID int    `json:"account_type_id" binding:"required"`
}
