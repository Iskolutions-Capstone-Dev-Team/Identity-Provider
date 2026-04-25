package service_test

import (
	"crypto/rand"
	"crypto/rsa"
	"os"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/google/uuid"
)

/**
 * TestGenerateAndValidateToken verifies JWT issuance and verification.
 */
func TestGenerateAndValidateToken(t *testing.T) {
	// 1. Setup keys
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("failed to generate rsa key: %v", err)
	}
	publicKey := &privateKey.PublicKey

	os.Setenv("CLIENT_BASE_URL", "http://localhost:8080")
	os.Setenv("KEY_ID", "test-key-id")

	clientID := uuid.New()
	client := &models.Client{
		ID:      clientID[:],
		BaseUrl: "http://client.com",
	}

	claims := models.UserClaims{
		UserID: "user-123",
	}

	// 2. Issuance
	token, err := service.GenerateToken(privateKey, client, claims)
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	if token == "" {
		t.Fatal("generated token is empty")
	}

	// 3. Validation
	valid, err := service.ValidateToken(token, publicKey)
	if err != nil {
		t.Fatalf("failed to validate token: %v", err)
	}

	if !valid {
		t.Error("expected token to be valid")
	}
}
