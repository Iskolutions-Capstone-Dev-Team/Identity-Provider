package initializers

import (
	"crypto/rsa"
	"log"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

var (
	PrivKey              *rsa.PrivateKey
	PubKey               *rsa.PublicKey
	PRIVATE_KEY_LOCATION = os.Getenv("PRIVATE_KEY_LOCATION")
	PUBLIC_KEY_LOCATION  = os.Getenv("PUBLIC_KEY_LOCATION")
)

func LoadRSAKeys() {
	var err error

	privBytes, err := os.ReadFile(PRIVATE_KEY_LOCATION)
	if err != nil {
		log.Fatal("Could not read private key: ", err)
	}

	PrivKey, err = jwt.ParseRSAPrivateKeyFromPEM(privBytes)
	if err != nil {
		log.Fatal("Could not parse private key: ", err)
	}

	pubBytes, err := os.ReadFile(PUBLIC_KEY_LOCATION)
	if err != nil {
		log.Fatal("Could not read public key: ", err)
	}
	PubKey, err = jwt.ParseRSAPublicKeyFromPEM(pubBytes)
	if err != nil {
		log.Fatal("Could not parse public key: ", err)
	}
}
