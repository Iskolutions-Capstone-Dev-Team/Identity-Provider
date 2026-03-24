package dto

import "time"

// PostOTPRequest is the payload for requesting a new verification code.
type OTPRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// PostOTPVerifyRequest is the payload to validate a user's code.
type PostOTPVerifyRequest struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required,len=6,numeric"`
}

// OTPResponse is the unified response for OTP operations.
type OTPResponse struct {
	Message    string    `json:"message"`
	ExpiresAt  time.Time `json:"expires_at,omitempty"`
	RetryCount int       `json:"retry_count,omitempty"`
}
