package dto

type ErrorResponse struct {
	Error string `json:"error" example:"Error description"`
}

type SuccessResponse struct {
	Message string `json:"message"`
}
