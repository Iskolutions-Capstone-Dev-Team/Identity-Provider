package models

import "github.com/google/uuid"

type AccountType struct {
	ID   int    `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
}

type PreapprovedClient struct {
	AccountTypeID int       `db:"account_type_id"`
	ClientID      uuid.UUID `db:"client_id"`
}
