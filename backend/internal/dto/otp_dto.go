package dto

/**
 * VerifyOTPRequest contains the fields required to verify an OTP.
 */
type VerifyOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
	OTP   string `json:"otp" binding:"required,len=6"`
}
