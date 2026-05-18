package utils

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha1"
	"encoding/base32"
	"encoding/binary"
	"fmt"
	"math"
	"strings"
	"time"
)

/**
 * GenerateTOTPSecret creates a random 20-byte secret and returns it
 * encoded in Base32.
 */
func GenerateTOTPSecret() (string, error) {
	secret := make([]byte, 20)
	_, err := rand.Read(secret)
	if err != nil {
		return "", err
	}
	return base32.StdEncoding.WithPadding(base32.NoPadding).
		EncodeToString(secret), nil
}

/**
 * ComputeTOTP calculates the 6-digit TOTP code for a given secret
 * at the current time (30-second interval).
 */
func ComputeTOTP(secretBase32 string) (string, error) {
	key, err := base32.StdEncoding.WithPadding(base32.NoPadding).
		DecodeString(strings.ToUpper(secretBase32))
	if err != nil {
		return "", err
	}

	// Calculate 30-second interval
	counter := uint64(time.Now().Unix() / 30)
	buf := make([]byte, 8)
	binary.BigEndian.PutUint64(buf, counter)

	// HMAC-SHA1
	h := hmac.New(sha1.New, key)
	h.Write(buf)
	sum := h.Sum(nil)

	// Dynamic truncation
	offset := sum[len(sum)-1] & 0xf
	v := int32(binary.BigEndian.Uint32(sum[offset:offset+4])) & 0x7fffffff

	// 6-digit code
	code := v % int32(math.Pow10(6))
	return fmt.Sprintf("%06d", code), nil
}
