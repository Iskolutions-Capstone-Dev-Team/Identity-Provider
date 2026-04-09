package middleware

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// APIKeyMiddleware validates the API key from the X-API-Key header.
/**
 * APIKeyMiddleware checks if the X-API-Key header matches the
 * VITE_BACKEND_API_KEY environment variable.
 */
func APIKeyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		expectedKey := os.Getenv("VITE_BACKEND_API_KEY")

		if apiKey == "" || apiKey != expectedKey {
			log.Printf("[APIKeyMiddleware] Auth Failure: invalid API key")
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		c.Next()
	}
}
