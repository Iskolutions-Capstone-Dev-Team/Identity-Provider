package middleware

import (
	"github.com/gin-gonic/gin"
)

// SecurityHeadersMiddleware adds required security headers and
// removes leaking headers like "Server".
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		csp := "default-src 'self'; script-src 'self'; " +
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
			"font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;"

		// Content Security Policy (CSP) Header Not Set
		c.Header("Content-Security-Policy", csp)

		// Missing Anti-clickjacking Header
		c.Header("X-Frame-Options", "DENY")

		hsts := "max-age=31536000; includeSubDomains; preload"
		// Strict-Transport-Security Header Not Set
		c.Header("Strict-Transport-Security", hsts)

		// Server Leaks Version Information via "Server" HTTP Response
		c.Writer.Header().Del("Server")

		c.Next()

		// Remove again in case it was set downstream
		c.Writer.Header().Del("Server")
	}
}
