package utils

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"math/big"

	"golang.org/x/crypto/bcrypt"
)

const OTPChars = "0123456789"

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

func HashCode(code string) string {
	hash := sha256.Sum256([]byte(code))
	return fmt.Sprintf("%x", hash)
}

/**
 * generateSecureCode uses crypto/rand to generate a non-predictable string.
 */
func GenerateSecureCode(n int) (string, error) {
	b := make([]byte, n)
	for i := range b {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(OTPChars))))
		if err != nil {
			return "", err
		}
		b[i] = OTPChars[num.Int64()]
	}
	return string(b), nil
}
