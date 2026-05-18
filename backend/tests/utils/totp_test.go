package utils_test

import (
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
)

func TestTOTPSecretGeneration(t *testing.T) {
	secret, err := utils.GenerateTOTPSecret()
	if err != nil {
		t.Fatalf("Failed to generate secret: %v", err)
	}

	if len(secret) == 0 {
		t.Error("Generated secret is empty")
	}
}

func TestComputeTOTP(t *testing.T) {
	secret := "JBSWY3DPEHPK3PXP" // Example Base32 secret
	code, err := utils.ComputeTOTP(secret)
	if err != nil {
		t.Fatalf("Failed to compute TOTP: %v", err)
	}

	if len(code) != 6 {
		t.Errorf("Expected 6-digit code, got %d digits", len(code))
	}
}
