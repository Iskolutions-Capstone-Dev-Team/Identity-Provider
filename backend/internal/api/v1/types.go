package v1

import "encoding/json"

const (
	PAGE_LIMIT         = 10
	TIME_LAYOUT        = "2006-01-02 15:04:05"
	SESSION_YEARS      = 0
	SESSION_MONTHS     = 0
	SESSION_DAYS       = 15
	HEADER_SIZE        = 512
	ACCESS_TOKEN_NAME  = "access_token"
	REFRESH_TOKEN_NAME = "refresh_token"
)

// buildMetadata is a helper to create json.RawMessage from a map.
func buildMetadata(data map[string]interface{}) json.RawMessage {
	b, _ := json.Marshal(data)
	return b
}
