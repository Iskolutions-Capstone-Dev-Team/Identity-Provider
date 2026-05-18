package utils_test

import (
	"os"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
)

func TestEncryptionDecryption(t *testing.T) {
	// Set a mock encryption key
	key := "94f9aae6af350c1f2ccb6f02702d66262a12ccb5aad6ef97f5bb283c4c5927ef"
	os.Setenv("MFA_ENCRYPTION_KEY", key)

	original := []byte("this is a secret message")

	encrypted, err := utils.Encrypt(original)
	if err != nil {
		t.Fatalf("Failed to encrypt: %v", err)
	}

	decrypted, err := utils.Decrypt(encrypted)
	if err != nil {
		t.Fatalf("Failed to decrypt: %v", err)
	}

	if string(decrypted) != string(original) {
		t.Errorf("Expected %s, got %s", string(original), string(decrypted))
	}
}

func TestInvalidKey(t *testing.T) {
	os.Setenv("MFA_ENCRYPTION_KEY", "invalid-key")
	_, err := utils.Encrypt([]byte("test"))
	if err == nil {
		t.Error("Expected error for invalid key, got nil")
	}
}
