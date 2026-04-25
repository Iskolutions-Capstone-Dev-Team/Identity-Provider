package service

import (
	"crypto/rsa"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// GenerateToken creates a signed OIDC JWT using RS256.
// It accepts the pre-loaded privateKey object for maximum performance.
func GenerateToken(privateKey *rsa.PrivateKey,
	client *models.Client, claims models.UserClaims,
) (string, error) {
	now := time.Now()

	clientIDStr, err := uuid.FromBytes(client.ID)
	if err != nil {
		return "", fmt.Errorf("failed to get uuid from client bytes: %v", err)
	}

	claims.AuthorizedParty = clientIDStr.String()

	claims.RegisteredClaims = jwt.RegisteredClaims{
		Subject:   claims.ID,
		Issuer:    os.Getenv("CLIENT_BASE_URL"),
		Audience:  jwt.ClaimStrings{client.BaseUrl},
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

func ValidateToken(token string, publicKey *rsa.PublicKey) (bool, error) {
	parsedToken, err := GetParsedToken(token, publicKey)
	if err != nil {
		log.Printf("[ValidateToken] Validation failed: %v", err)
		return false, err
	}

	return parsedToken.Valid, nil
}

func GetParsedToken(token string, publicKey *rsa.PublicKey) (jwt.Token, error) {
	parsedToken, err := jwt.ParseWithClaims(
		token,
		&models.UserClaims{},
		func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return publicKey, nil
		},
	)

	if err != nil {
		return jwt.Token{}, err
	}
	return *parsedToken, err
}
