package dto

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
