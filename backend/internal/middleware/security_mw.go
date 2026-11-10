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
			"script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net https://challenges.cloudflare.com; " +
			"style-src 'self' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=' 'sha256-CIxDM5jnsGiKqXs2v7NKCY5MzdR9gu6TtiMJrDw29AY=' 'sha256-zGa58lXb2oygE4hoHpmzXYA2TBtkgAZDzFuKlQ2FzyI=' 'sha256-kLmvWqfziFavKtqHqRsb90f006UAK2Dmd0It5Iz2KFA=' 'sha256-StEaX+se6YS7pqjzrzMIA0KaX9zF/8zAhvQXZAe5epY=' 'sha256-qv/lLZ+h6qkk6F0yffkDTgVFHR6dUogNKazioCz5Tyo='; " +
			"style-src-attr 'unsafe-inline'; " +
			"font-src 'self' data:; " +
			"img-src 'self' data: blob: http://localhost:9000 https://*.amazonaws.com https://*.s3.dualstack.ap-southeast-1.amazonaws.com; " +
			"connect-src 'self' http://localhost:8080 http://localhost:5173 http://localhost:5174 http://localhost:9000 blob: data:; " +
			"worker-src 'self' blob:; " +
			"child-src 'self' blob:; " +
			"frame-src 'self' https://challenges.cloudflare.com; " +
			"media-src 'self' blob: data:;"

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
