package middleware

import (
	"github.com/gin-gonic/gin"
)

// SecurityHeadersMiddleware adds required security headers and
// removes leaking headers like "Server".
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		csp := "default-src 'self'; " +
			"base-uri 'self'; " +
			"object-src 'none'; " +
			"frame-ancestors 'none'; " +
			"form-action 'self'; " +
			"script-src 'self'; " +
			"style-src 'self' 'unsafe-inline'; " +
			"font-src 'self' data:; " +
			"img-src 'self' data:; " +
			"connect-src 'self';"

		// Content Security Policy (CSP) Header
		c.Header("Content-Security-Policy", csp)

		// Missing Anti-clickjacking Header
		c.Header("X-Frame-Options", "DENY")

		// Prevent MIME type sniffing
		c.Header("X-Content-Type-Options", "nosniff")

		hsts := "max-age=31536000; includeSubDomains; preload"
		// Strict-Transport-Security Header
		c.Header("Strict-Transport-Security", hsts)

		// Server Leaks Version Information via "Server" HTTP Response
		c.Writer.Header().Del("Server")

		c.Next()

		// Remove again in case it was set downstream
		c.Writer.Header().Del("Server")
	}
}
