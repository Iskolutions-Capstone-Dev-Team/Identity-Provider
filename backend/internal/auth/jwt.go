package auth

import (
	"crypto/rsa"
	"encoding/hex"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/golang-jwt/jwt/v5"
)

// GenerateToken creates a signed OIDC JWT using RS256.
// It accepts the pre-loaded privateKey object for maximum performance.
func GenerateToken(privateKey *rsa.PrivateKey,
	clientID []byte, claims models.UserClaims,
) (string, error) {
	now := time.Now()

	clientIDStr := hex.EncodeToString(clientID)

	claims.RegisteredClaims = jwt.RegisteredClaims{
		Subject:   claims.ID,
		Issuer:    "pupt-idp",
		Audience:  jwt.ClaimStrings{clientIDStr},
		ExpiresAt: jwt.NewNumericDate(now.Add(1 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(now),
		NotBefore: jwt.NewNumericDate(now),
		ID:        fmt.Sprintf("%d", now.UnixNano()),
	}
	

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)

	token.Header["kid"] = os.Getenv("KEY_ID")

	signedToken, err := token.SignedString(privateKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign JWT: %w", err)
	}

	return signedToken, nil
}

func ValidateToken(token string, pubKey *rsa.PublicKey,) (bool, error) {
	parsedToken, err := jwt.ParseWithClaims(
		token,
		&models.UserClaims{},
		func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return pubKey, nil
		},
	)

	if err != nil {
		log.Printf("[ValidateToken] Validation failed: %v", err)
		return false, err
	}

	return parsedToken.Valid, nil
}
