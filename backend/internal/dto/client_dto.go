package dto

type CreateClientRequest struct {
	Name        string   `json:"name"`
	Tag         string   `json:"tag"`
	BaseURL     string   `json:"base_url"`
	RedirectURI string   `json:"redirect_uri"`
	LogoutURI   string   `json:"logout_uri"`
	Description string   `json:"description"`
	Grants      []string `json:"grants"`
	RoleIDs     []int    `json:"role_ids"`
}

type ClientResponse struct {
	ID            string         `json:"id"`
	Name          string         `json:"name"`
	Tag           string         `json:"tag"`
	Description   string         `json:"description"`
	ImageLocation string         `json:"image_location"`
	BaseURL       string         `json:"base_url"`
	RedirectURI   string         `json:"redirect_uri"`
	LogoutURI     string         `json:"logout_uri"`
	CreatedAt     string         `json:"created_at"`
	Grants        []string       `json:"grants"`
	AllowedRoles  []RoleResponse `json:"allowed_roles"`
}

type ClientListResponse struct {
	Clients     []ClientResponse `json:"clients"`
	TotalCount  int              `json:"total_count"`
	CurrentPage int              `json:"current_page"`
	LastPage    int              `json:"last_page"`
}

type ClientSecretResponse struct {
	ID           string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	Message      string `json:"message"`
}
