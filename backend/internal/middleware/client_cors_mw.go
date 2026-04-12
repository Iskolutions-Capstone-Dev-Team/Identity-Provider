package middleware

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// ClientCORSMiddleware allows cross-origin requests ONLY from CLIENT_BASE_URL.
/**
 * ClientCORSMiddleware restricts cross-origin resource sharing to the
 * CLIENT_BASE_URL environment variable, intended for the IDP client.
 */
func (m *Middleware) ClientCORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		if origin == "" {
			c.Next()
			return
		}

		clientBaseURL := os.Getenv("CLIENT_BASE_URL")

		// If the origin matches exactly the CLIENT_BASE_URL, apply headers
		if origin == clientBaseURL {
			h := c.Writer.Header()
			h.Set("Access-Control-Allow-Origin", origin)
			h.Set("Access-Control-Allow-Credentials", "true")
			h.Set("Access-Control-Allow-Methods",
				"GET, POST, PUT, PATCH, DELETE, OPTIONS")
			h.Set("Access-Control-Allow-Headers",
				"Content-Type, Authorization, X-API-Key")
		}

		// Handle preflight OPTIONS requests
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
