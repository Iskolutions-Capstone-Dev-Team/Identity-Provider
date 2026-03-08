package service

import (
	"crypto/rsa"
	"encoding/base64"
	"math/big"
)

type JWK struct {
	KeyType   string `json:"kty"`
	KeyID     string `json:"kid"`
	Use       string `json:"use"`
	Algorithm string `json:"alg"`
	Modulus   string `json:"n"`
	Exponent  string `json:"e"`
}

type JWKS struct {
	Keys []JWK `json:"keys"`
}

func PublicKeyToJWK(pub *rsa.PublicKey, kid string) JWK {
	nStr := base64.RawURLEncoding.EncodeToString(pub.N.Bytes())

	eBytes := big.NewInt(int64(pub.E)).Bytes()
	eStr := base64.RawURLEncoding.EncodeToString(eBytes)

	return JWK{
		KeyType:   "RSA",
		KeyID:     kid,
		Use:       "sig",
		Algorithm: "RS256",
		Modulus:   nStr,
		Exponent:  eStr,
	}
}
