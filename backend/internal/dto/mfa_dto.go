package dto

type TOTPSetupRequest struct {
	Email string `json:"email" binding:"required"`
}

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

type MFAAuthenticatorListRequest struct {
	Email string `json:"email" binding:"required"`
}
