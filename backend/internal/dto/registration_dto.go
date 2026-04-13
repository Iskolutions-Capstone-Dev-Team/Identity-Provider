package dto

import "github.com/google/uuid"

type PreapprovedClientResponse struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type AccountTypeConfigResponse struct {
	ID          int                         `json:"id"`
	AccountType string                      `json:"account_type"`
	Clients     []PreapprovedClientResponse `json:"clients"`
}

type RegistrationConfigResponse struct {
	AccountTypes []AccountTypeConfigResponse `json:"account_types"`
}

type UpsertAccountTypeRequest struct {
	ID        int      `json:"id" binding:"required"`
	Name      string   `json:"name" binding:"required"`
	ClientIDs []string `json:"client_ids" binding:"required"`
}

type ActivateAccountRequest struct {
	InvitationCode string `json:"invitation_code" binding:"required"`
	Password       string `json:"password" binding:"required"`
}
