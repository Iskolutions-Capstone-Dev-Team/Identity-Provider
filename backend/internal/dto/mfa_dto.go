package dto

import (
	"time"
)

type TOTPSetupResponse struct {
	Secret     string `json:"secret"`
	OTPAuthURI string `json:"otpauth_uri"`
}

type TOTPFinalizeRequest struct {
	Email  string `json:"email" binding:"required"`
	Secret string `json:"secret" binding:"required"`
	Code   string `json:"code" binding:"required"`
	Name   string `json:"name" binding:"required"`
}

type MFASetupResponse struct {
	OTPAuthURI  string   `json:"otpauth_uri"`
	BackupCodes []string `json:"backup_codes"`
}

type MFAVerifyRequest struct {
	Email string `json:"email" binding:"required"`
	Code  string `json:"code" binding:"required"`
}

type MFADeleteRequest struct {
	Email string `json:"email" binding:"required"`
	ID    string `json:"id" binding:"required"`
}

type MFAAuthenticatorResponse struct {
	ID         string     `json:"id"`
	Type       string     `json:"type"`
	Name       string     `json:"name"`
	CreatedAt  time.Time  `json:"created_at"`
	LastUsedAt *time.Time `json:"last_used_at"`
}

// PasskeyBeginRequest is sent to start a passkey registration or
// authentication ceremony. The backend uses the email to load the
// user and build the WebAuthn challenge.
type PasskeyBeginRequest struct {
	Email string `json:"email" binding:"required"`
}
