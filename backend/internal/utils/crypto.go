package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"os"

	"golang.org/x/crypto/bcrypt"
)

/**
 * Encrypt encrypts plain text using AES-GCM with MFA_ENCRYPTION_KEY.
 */
func Encrypt(plainText []byte) ([]byte, error) {
	keyHex := os.Getenv("MFA_ENCRYPTION_KEY")
	key, err := hex.DecodeString(keyHex)
	if err != nil {
		return nil, fmt.Errorf("invalid encryption key: %w", err)
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	return gcm.Seal(nonce, nonce, plainText, nil), nil
}

/**
 * Decrypt decrypts cipher text using AES-GCM with MFA_ENCRYPTION_KEY.
 */
func Decrypt(cipherText []byte) ([]byte, error) {
	keyHex := os.Getenv("MFA_ENCRYPTION_KEY")
	key, err := hex.DecodeString(keyHex)
	if err != nil {
		return nil, fmt.Errorf("invalid encryption key: %w", err)
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := gcm.NonceSize()
	if len(cipherText) < nonceSize {
		return nil, fmt.Errorf("ciphertext too short")
	}

	nonce, ciphertext := cipherText[:nonceSize], cipherText[nonceSize:]
	return gcm.Open(nil, nonce, ciphertext, nil)
}

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
