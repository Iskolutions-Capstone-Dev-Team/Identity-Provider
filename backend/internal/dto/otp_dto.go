package dto

/**
 * VerifyOTPRequest contains the fields required to verify an OTP.
 */
type VerifyOTPRequest struct {
	UserID string `json:"user_id" binding:"required"`
	OTP    string `json:"otp" binding:"required,len=6"`
}
