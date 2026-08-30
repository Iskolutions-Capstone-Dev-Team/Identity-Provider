package dto

import "time"

// UserDeviceResponse represents the response format for listing user devices.
type UserDeviceResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	IPAddress string    `json:"ip_address"`
	UserAgent string    `json:"user_agent"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

// UpdateDeviceRequest represents the request payload to rename a user device.
type UpdateDeviceRequest struct {
	Name string `json:"name" binding:"required"`
}
