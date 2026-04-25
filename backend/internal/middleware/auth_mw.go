package middleware

import (
	"crypto/rsa"
	"encoding/json"
	"log"
	"net/http"
	"slices"
	"strings"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func buildMetadataForMW(m map[string]interface{}) json.RawMessage {
	b, err := json.Marshal(m)
	if err != nil {
		return json.RawMessage(`{}`)
	}
	return json.RawMessage(b)
}

// AuthMiddleware validates the RSA JWT from the Authorization Header.
func AuthMiddleware(publicKey *rsa.PublicKey, logService service.LogService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		parts := strings.Split(authHeader, " ")

		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Printf("[AuthMiddleware] Token Extraction: invalid format")
			if logService != nil {
				_ = logService.PostSecurityLogWithActorString(c.Request.Context(), c.ClientIP(), &dto.PostAuditLogRequest{
					Action: "invalid_token_usage",
					Target: "auth_header",
					Status: models.StatusFail,
					Metadata: buildMetadataForMW(map[string]interface{}{
						"ip":         c.ClientIP(),
						"user_agent": c.Request.UserAgent(),
						"error":      "invalid authorization header format",
					}),
				})
			}
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		token, err := service.GetParsedToken(parts[1], publicKey)
		if err != nil {
			log.Printf("[AuthMiddleware] Token Validation: %v", err)

			status := http.StatusUnauthorized
			errorMsg := "invalid_token"

			// Specifically handle expired tokens for frontend auto-refresh
			if strings.Contains(err.Error(), jwt.ErrTokenExpired.Error()) {
				errorMsg = "token_expired"
			}

			if logService != nil {
				_ = logService.PostSecurityLogWithActorString(c.Request.Context(),
					c.ClientIP(), &dto.PostAuditLogRequest{
						Action: "invalid_token_usage",
						Target: "auth_header",
						Status: models.StatusFail,
						Metadata: buildMetadataForMW(map[string]interface{}{
							"ip":         c.ClientIP(),
							"user_agent": c.Request.UserAgent(),
							"error":      err.Error(),
						}),
					})
			}
			c.AbortWithStatusJSON(status, dto.ErrorResponse{Error: errorMsg})
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
	logService service.LogService,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr, err := c.Cookie("access_token")
		if err != nil {
			log.Printf("[AuthorizeRBAC] Token Extraction: cookie missing")
			if logService != nil {
				_ = logService.PostSecurityLogWithActorString(c.Request.Context(), c.ClientIP(), &dto.PostAuditLogRequest{
					Action: "invalid_token_usage",
					Target: "access_token_cookie",
					Status: models.StatusFail,
					Metadata: buildMetadataForMW(map[string]interface{}{
						"ip":         c.ClientIP(),
						"user_agent": c.Request.UserAgent(),
						"error":      "missing token cookie",
					}),
				})
			}
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		token, err := service.GetParsedToken(tokenStr, publicKey)
		if err != nil {
			log.Printf("[AuthorizeRBAC] Token Validation: %v", err)

			status := http.StatusUnauthorized
			errorMsg := "invalid_token"

			if strings.Contains(err.Error(), jwt.ErrTokenExpired.Error()) {
				errorMsg = "token_expired"
			}

			if logService != nil {
				_ = logService.PostSecurityLogWithActorString(c.Request.Context(),
					c.ClientIP(), &dto.PostAuditLogRequest{
						Action: "invalid_token_usage",
						Target: "access_token_cookie",
						Status: models.StatusFail,
						Metadata: buildMetadataForMW(map[string]interface{}{
							"ip":         c.ClientIP(),
							"user_agent": c.Request.UserAgent(),
							"error":      err.Error(),
						}),
					})
			}
			c.AbortWithStatusJSON(status, dto.ErrorResponse{Error: errorMsg})
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

		// Fetch and set all permissions based on role
		roleIDs := []int{user.Role.ID}

		permMap, err := roleRepo.FetchPermissionsForRoles(ctx, roleIDs)
		permissionsSet := make(map[string]bool)
		if err != nil {
			log.Printf("[AuthorizeRBAC] Fetch permissions failed: %v", err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		if len(permMap) == 0 {
			log.Printf(
				"[AuthorizeRBAC] No permissions found for user %s", user.Email,
			)
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		for _, perms := range permMap {
			for _, p := range perms {
				permissionsSet[p.PermissionName] = true
			}
		}

		permissions := make([]string, 0, len(permissionsSet))
		for p := range permissionsSet {
			permissions = append(permissions, p)
		}

		c.Set("user_id", claims.UserID)
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
