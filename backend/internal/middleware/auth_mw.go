package middleware

import (
	"crypto/rsa"
	"log"
	"net/http"
	"os"
	"slices"
	"strings"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const HeaderAPIKey = "X-API-Key"

// AuthMiddleware validates the RSA JWT from the Authorization Header.
func AuthMiddleware(publicKey *rsa.PublicKey) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		parts := strings.Split(authHeader, " ")

		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Printf("[AuthMiddleware] Token Extraction: invalid format")
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		token, err := service.GetParsedToken(parts[1], publicKey)
		if err != nil {
			log.Printf("[AuthMiddleware] Token Validation: %v", err)
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		claims := token.Claims.(*models.UserClaims)

		c.Set("user_id", claims.UserID)
		c.Set("client_id", claims.AuthorizedParty)
		c.Next()
	}
}

// AuthorizeRBAC validates a JWT from a Cookie and checks required roles.
func AuthorizeRBAC(publicKey *rsa.PublicKey,
	userRepo *repository.UserRepository, authorizedRoles ...string,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr, err := c.Cookie("access_token")
		if err != nil {
			log.Printf("[AuthorizeRBAC] Token Extraction: cookie missing")
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		token, err := service.GetParsedToken(tokenStr, publicKey)
		if err != nil {
			log.Printf("[AuthorizeRBAC] Token Validation: %v", err)
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		claims := token.Claims.(*models.UserClaims)
		userID, err := uuid.Parse(string(claims.UserID))
		if err != nil {
			log.Printf("[AuthorizeRBAC] UUID Parse Error: %v", err)
			c.AbortWithStatus(http.StatusInternalServerError)
		}

		user, err := userRepo.GetUserById(userID[:])
		if err != nil {
			log.Printf("[AuthorizeRBAC] Fetch user failed: %v", err)
			c.AbortWithStatus(http.StatusInternalServerError)
		}

		roleNames := service.GetRoleNames(user.Roles)
		role := ""
		authorized := false
		if len (authorizedRoles) > 0 {
			for _, authorizedRole := range authorizedRoles {
				if slices.Contains(roleNames, authorizedRole) {
						authorized = true
						role = authorizedRole
					}
				if authorized {
					break
				}
			}

			if !authorized {
				log.Print("Insufficient Permissions")
				c.JSON(http.StatusForbidden,
					gin.H{"error": "Insufficient permissions"},
				)
				c.Abort()
				return
			}
		}

		c.Set("user_id", claims.UserID)
		c.Set("role", role)
		c.Set("email", user.Email)
		c.Set("client_id", claims.AuthorizedParty)
		c.Next()
	}
}

func APIKeyAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader(HeaderAPIKey)
		validAPIKey := os.Getenv("VITE_BACKEND_API_KEY")

		if apiKey == "" {
			log.Println("[APIKeyAuth] Header Retrieval: missing api key")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "API key is required",
			})
			return
		}

		if apiKey != validAPIKey {
			log.Println("[APIKeyAuth] Key Validation: invalid api key")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid API key",
			})
			return
		}

		c.Next()
	}
}