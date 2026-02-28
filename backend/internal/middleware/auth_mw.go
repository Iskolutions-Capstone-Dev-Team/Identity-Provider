package middleware

import (
	"crypto/rsa"
	"fmt"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthorizeRBAC validates an RS256 JWT and checks for required roles.
// It takes the pre-loaded publicKey from main.go to avoid disk I/O on every request.
func AuthorizeRBAC(publicKey *rsa.PublicKey,
	requiredRoles ...string,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Extract the token from the Cookie Jar
		tokenString, err := c.Cookie("access_token")
		if err != nil {
			// [AuthMiddleware] Cookie Retrieval: access_token not found
			c.JSON(http.StatusUnauthorized,
				gin.H{"error": "Authentication session not found"},
			)
			c.Abort()
			return
		}

		// 2. Parse and Validate the Token using the RSA Public Key
		claims := &models.UserClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims,
			func(token *jwt.Token) (interface{}, error) {
				// Ensure the signing method is RSA
				if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v",
						token.Header["alg"])
				}
				return publicKey, nil
			})

		if err != nil || !token.Valid {
			// [AuthMiddleware] Token Validation: invalid or expired
			c.JSON(http.StatusUnauthorized,
				gin.H{"error": "Invalid or expired session"},
			)
			c.Abort()
			return
		}

		// 3. Role-Based Access Control (RBAC) Check
		if len(requiredRoles) > 0 {
			authorized := false
			for _, userRole := range claims.Roles {
				for _, reqRole := range requiredRoles {
					if userRole == reqRole {
						authorized = true
						break
					}
				}
				if authorized {
					break
				}
			}

			if !authorized {
				c.JSON(http.StatusForbidden,
					gin.H{"error": "Insufficient permissions"},
				)
				c.Abort()
				return
			}
		}

		// 4. Context Injection for subsequent handlers
		c.Set("user_id", claims.UserID)
		c.Set("user_claims", claims)

		c.Next()
	}
}
