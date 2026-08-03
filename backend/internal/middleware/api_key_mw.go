package middleware

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// APIKeyMiddleware validates the API key or matches the origin.
/**
 * APIKeyMiddleware checks if the X-API-Key header matches the
 * BACKEND_API_KEY environment variable, or if the request
 * origin matches the CLIENT_BASE_URL.
 */
func APIKeyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientBaseURL := os.Getenv("CLIENT_BASE_URL")
		origin := c.GetHeader("Origin")
		referer := c.GetHeader("Referer")

		// Skip API key check if the request originates from CLIENT_BASE_URL
		isAllowedOrigin := (origin != "" && origin == clientBaseURL) ||
			(referer != "" && strings.HasPrefix(referer, clientBaseURL))

		if isAllowedOrigin {
			c.Next()
			return
		}

		apiKey := c.GetHeader("X-API-Key")
		expectedKey := os.Getenv("BACKEND_API_KEY")

		if apiKey == "" || apiKey != expectedKey {
			log.Printf("[APIKeyMiddleware] Auth Failure: invalid API key")
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		c.Next()
	}
}
