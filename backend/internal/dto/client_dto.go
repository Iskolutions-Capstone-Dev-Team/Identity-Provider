package dto

type ClientResponse struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Tag           string `json:"tag"`
	Description   string `json:"description"`
	ImageLocation string `json:"image_location"`
	BaseURL       string `json:"base_url"`
	RedirectURI   string `json:"redirect_uri"`
	LogoutURI     string `json:"logout_uri"`
	CreatedAt     string `json:"created_at"`
}

type ClientListResponse struct {
	Clients     []ClientResponse `json:"clients"`
	TotalCount  int              `json:"total_count"`
	CurrentPage int              `json:"current_page"`
	LastPage    int              `json:"last_page"`
}
