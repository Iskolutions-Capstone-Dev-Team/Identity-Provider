package utils

import (
	"encoding/base64"
	"encoding/json"
)

// ParseRememberDeviceCookie parses the remember_device cookie value into a
// map of user ID strings to device tokens. If the value is not valid JSON
// after base64 decoding, it falls back to treating the raw value as a single
// token under an empty string key.
func ParseRememberDeviceCookie(cookieVal string) map[string]string {
	tokens := make(map[string]string)
	if cookieVal == "" {
		return tokens
	}

	// Decode base64
	decoded, err := base64.RawURLEncoding.DecodeString(cookieVal)
	if err != nil {
		// Fallback: it might be an unencoded legacy token
		tokens[""] = cookieVal
		return tokens
	}

	// Try parsing decoded as JSON map
	err = json.Unmarshal(decoded, &tokens)
	if err != nil {
		// Fallback: it might be base64 but not JSON, or a legacy token
		tokens[""] = cookieVal
	}
	return tokens
}

// GetDeviceTokenForUser retrieves the device token for a specific user ID.
// If the specific user ID is not found, it checks if a legacy single
// token is present in the cookie.
func GetDeviceTokenForUser(cookieVal string, userID string) string {
	tokens := ParseRememberDeviceCookie(cookieVal)
	if token, ok := tokens[userID]; ok {
		return token
	}
	// Fallback to legacy single token if present
	if token, ok := tokens[""]; ok {
		return token
	}
	return ""
}

// UpdateRememberDeviceCookie adds or updates the device token for the given
// user ID in the cookie value, serializes the map, base64 encodes it, and
// returns the new cookie value.
func UpdateRememberDeviceCookie(
	cookieVal string,
	userID string,
	token string,
) string {
	tokens := ParseRememberDeviceCookie(cookieVal)
	// Remove the legacy empty key entry if it exists to keep cookie clean
	delete(tokens, "")
	tokens[userID] = token

	bytes, err := json.Marshal(tokens)
	if err != nil {
		return token // Fallback to just the token if marshal fails
	}
	return base64.RawURLEncoding.EncodeToString(bytes)
}
