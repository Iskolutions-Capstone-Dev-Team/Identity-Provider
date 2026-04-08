package utils

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func GenerateAuthorizationCode() (string, error) {
	b := make([]byte, 32)

	_, err := rand.Read(b)
	if err != nil {
		return "", fmt.Errorf("failed to generate secure bytes: %w", err)
	}

	return base64.RawURLEncoding.EncodeToString(b), nil
}

func HashSecret(plainText string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(plainText), 12)
	return string(bytes), err
}

func CompareSecret(hashed, plain string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashed), []byte(plain))
}

func GenerateRandomString(length int) (string, error) {
    b := make([]byte, length)
    
    if _, err := rand.Read(b); err != nil {
        return "", err
    }

	return base64.RawURLEncoding.EncodeToString(b), nil
}

// GenerateOTP returns a random 6-digit numeric string.
func GenerateOTP() (string, error) {
	b := make([]byte, 6)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	
	// Convert bytes to digits 0-9
	otp := ""
	for i := 0; i < 6; i++ {
		otp += fmt.Sprintf("%d", b[i]%10)
	}
	
	return otp, nil
}

