package dto

type TOTPSetupResponse struct {
	Secret     string `json:"secret"`
	OTPAuthURI string `json:"otpauth_uri"`
}

type TOTPFinalizeRequest struct {
	Secret string `json:"secret" binding:"required"`
	Code   string `json:"code" binding:"required"`
	Name   string `json:"name" binding:"required"`
}

type MFASetupResponse struct {
	OTPAuthURI  string   `json:"otpauth_uri"`
	BackupCodes []string `json:"backup_codes"`
}

type MFAVerifyRequest struct {
	Code string `json:"code" binding:"required"`
}

type MFADeleteRequest struct {
	ID string `json:"id" binding:"required"`
}
