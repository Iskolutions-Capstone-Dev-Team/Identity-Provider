package middleware

import (
	"crypto/rsa"
	"log"
	"net/http"
	"strings"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

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
			log.Printf("[GetMe] UUID Parse Error: %v", err)
			c.AbortWithStatus(http.StatusInternalServerError)
		}

		roles, err := userRepo.GetRoles(userID[:])
		if err != nil {
			log.Printf("[GetMe] Fetch Roles Failed: %v", err)
			c.AbortWithStatus(http.StatusInternalServerError)
		}

		roleNames := service.GetRoleNames(roles)
		authorized := false
		if len (authorizedRoles) > 0 {
			for _, authorizedRole := range authorizedRoles {
				for _, role := range roleNames {
					if role == authorizedRole {
						authorized = true
						break
					}
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
		c.Set("client_id", claims.AuthorizedParty)
		c.Next()
	}
}
