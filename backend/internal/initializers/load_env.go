package initializers

import (
	"log"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	err := godotenv.Load("../../.env")
	if err != nil {
		log.Printf("[LoadEnv] File Search: %v", err)
	}
}
