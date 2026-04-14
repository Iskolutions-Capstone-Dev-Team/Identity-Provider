package models

import "time"

type InvitationCode struct {
	ID             int       `db:"id"`
	Email          string    `db:"email"`
	AccountTypeID  int       `db:"account_type_id"`
	InvitationCode string    `db:"invitation_code"`
	CreatedAt      time.Time `db:"created_at"`
}
