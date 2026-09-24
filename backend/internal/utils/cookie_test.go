package utils_test

import (
	"encoding/base64"
	"encoding/json"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
)

func TestParseRememberDeviceCookie(t *testing.T) {
	// 1. Empty cookie
	t.Run("Empty Cookie", func(t *testing.T) {
		res := utils.ParseRememberDeviceCookie("")
		if len(res) != 0 {
			t.Errorf("expected empty map, got %v", res)
		}
	})

	// 2. Legacy/raw token
	t.Run("Legacy Token", func(t *testing.T) {
		rawToken := "some-legacy-token"
		res := utils.ParseRememberDeviceCookie(rawToken)
		if len(res) != 1 || res[""] != rawToken {
			t.Errorf("expected map with empty-string key, got %v", res)
		}
	})

	// 3. Valid encoded map
	t.Run("Valid Multi-User Map", func(t *testing.T) {
		data := map[string]string{
			"user1": "token1",
			"user2": "token2",
		}
		bytes, _ := json.Marshal(data)
		encoded := base64.RawURLEncoding.EncodeToString(bytes)

		res := utils.ParseRememberDeviceCookie(encoded)
		if len(res) != 2 ||
			res["user1"] != "token1" ||
			res["user2"] != "token2" {
			t.Errorf("expected parsed map to match original data, got %v", res)
		}
	})
}

func TestGetDeviceTokenForUser(t *testing.T) {
	// 1. Map containing user ID
	t.Run("User in Map", func(t *testing.T) {
		data := map[string]string{
			"user-123": "token-abc",
		}
		bytes, _ := json.Marshal(data)
		cookie := base64.RawURLEncoding.EncodeToString(bytes)

		token := utils.GetDeviceTokenForUser(cookie, "user-123")
		if token != "token-abc" {
			t.Errorf("expected token-abc, got %s", token)
		}
	})

	// 2. Map not containing user ID but contains legacy token
	t.Run("Fallback to Legacy", func(t *testing.T) {
		cookie := "legacy-token-xyz"
		token := utils.GetDeviceTokenForUser(cookie, "any-user")
		if token != "legacy-token-xyz" {
			t.Errorf("expected legacy-token-xyz, got %s", token)
		}
	})

	// 3. User not found and no legacy token
	t.Run("Not Found", func(t *testing.T) {
		data := map[string]string{
			"user-456": "token-def",
		}
		bytes, _ := json.Marshal(data)
		cookie := base64.RawURLEncoding.EncodeToString(bytes)

		token := utils.GetDeviceTokenForUser(cookie, "user-123")
		if token != "" {
			t.Errorf("expected empty string, got %s", token)
		}
	})
}

func TestUpdateRememberDeviceCookie(t *testing.T) {
	// Update with new user on empty cookie
	cookieVal := utils.UpdateRememberDeviceCookie("", "user-1", "token-1")

	// Verify we can parse it back
	tokens := utils.ParseRememberDeviceCookie(cookieVal)
	if len(tokens) != 1 || tokens["user-1"] != "token-1" {
		t.Errorf("expected user-1: token-1, got %v", tokens)
	}

	// Update existing cookie with another user
	cookieVal2 := utils.UpdateRememberDeviceCookie(
		cookieVal,
		"user-2",
		"token-2",
	)
	tokens2 := utils.ParseRememberDeviceCookie(cookieVal2)
	if len(tokens2) != 2 ||
		tokens2["user-1"] != "token-1" ||
		tokens2["user-2"] != "token-2" {
		t.Errorf("expected 2 users in cookie, got %v", tokens2)
	}

	// Overwrite existing user token
	cookieVal3 := utils.UpdateRememberDeviceCookie(
		cookieVal2,
		"user-1",
		"token-3",
	)
	tokens3 := utils.ParseRememberDeviceCookie(cookieVal3)
	if len(tokens3) != 2 ||
		tokens3["user-1"] != "token-3" ||
		tokens3["user-2"] != "token-2" {
		t.Errorf("expected updated token for user-1, got %v", tokens3)
	}
}
