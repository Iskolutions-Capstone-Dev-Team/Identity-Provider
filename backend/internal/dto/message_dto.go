package dto

// ErrorResponse represents a standardized API error response.
type ErrorResponse struct {
	Code            int    `json:"code" example:"1001"`
	Message         string `json:"message" example:"User-friendly message"`
	Error           string `json:"error" example:"Internal technical details"`
	RequiresCaptcha bool   `json:"requires_captcha,omitempty"`
	SiteKey         string `json:"site_key,omitempty"`
}

type SuccessResponse struct {
	Message string `json:"message"`
}
