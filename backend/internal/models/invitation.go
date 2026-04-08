package models

import "time"

type InvitationType string

const (
	InvitationStudent   InvitationType = "student"
	InvitationAdmin     InvitationType = "admin"
	InvitationGuest     InvitationType = "guest"
	InvitationApplicant InvitationType = "applicant"
)

type InvitationCode struct {
	ID             int            `db:"id"`
	Email          string         `db:"email"`
	InvitationType InvitationType `db:"invitation_type"`
	InvitationCode string         `db:"invitation_code"`
	CreatedAt      time.Time      `db:"created_at"`
}
