package dto

import "github.com/google/uuid"

type PreapprovedClientResponse struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type AccountTypeConfigResponse struct {
	AccountType string                      `json:"account_type"`
	Clients     []PreapprovedClientResponse `json:"clients"`
}

type RegistrationConfigResponse struct {
	AccountTypes []AccountTypeConfigResponse `json:"account_types"`
}

type UpdatePreapprovedClientsRequest struct {
	AccountTypeID int      `json:"account_type_id"`
	ClientIDs     []string `json:"client_ids"`
}
