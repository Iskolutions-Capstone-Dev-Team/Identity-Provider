package dto

/**
 * VerifyOTPRequest contains the fields required to verify an OTP.
 */
type VerifyOTPRequest struct {
	Email          string `json:"email" binding:"required,email"`
	OTP            string `json:"otp" binding:"required,len=6"`
	RememberDevice bool   `json:"remember_device"`
}

// OTPSendResponse is the payload returned after an OTP is requested.
type OTPSendResponse struct {
	Message          string `json:"message"`
	RemainingSeconds int    `json:"remaining_seconds"`
}
