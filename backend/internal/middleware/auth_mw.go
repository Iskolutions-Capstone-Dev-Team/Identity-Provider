package middleware

import (
	"crypto/rsa"
	"log"
	"net/http"
	"slices"
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
	userRepo repository.UserRepository,
	roleRepo repository.RoleRepository,
	authorizedRoles ...string,
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
			return
		}

		ctx := c.Request.Context()
		user, err := userRepo.GetUserById(ctx, userID[:])
		if err != nil {
			log.Printf("[AuthorizeRBAC] Fetch user failed: %v", err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		// Fetch and set all permissions based on roles
		roleIDs := make([]int, len(user.Roles))
		for i, r := range user.Roles {
			roleIDs[i] = r.ID
		}

		permMap, err := roleRepo.FetchPermissionsForRoles(ctx, roleIDs)
		permissionsSet := make(map[string]bool)
		if err == nil {
			for _, perms := range permMap {
				for _, p := range perms {
					permissionsSet[p.PermissionName] = true
				}
			}
		}

		permissions := make([]string, 0, len(permissionsSet))
		for p := range permissionsSet {
			permissions = append(permissions, p)
		}

		roleNames := service.GetRoleNames(user.Roles)
		role := ""
		authorized := false
		if len(authorizedRoles) > 0 {
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
		c.Set("permissions", permissions)
		c.Set("client_id", claims.AuthorizedParty)
		c.Next()
	}
}

// HasPermission checks if a given permission string exists in the context.
func HasPermission(c *gin.Context, permission string) bool {
	perms, exists := c.Get("permissions")
	if !exists {
		return false
	}
	permissionList, ok := perms.([]string)
	if !ok {
		return false
	}
	return slices.Contains(permissionList, permission)
}
