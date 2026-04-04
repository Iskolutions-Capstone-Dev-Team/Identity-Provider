package api

import (
	"crypto/rsa"
	"net/http"

	v1 "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/gin-gonic/gin"
)

type Handlers struct {
	LogHandler        *v1.LogHandler
	AuthHandler       *v1.AuthHandler
	ClientHandler     *v1.ClientHandler
	RoleHandler       *v1.RoleHandler
	UserHandler       *v1.UserHandler
	PermissionHandler *v1.PermissionHandler
	UserRepo          repository.UserRepository
	RoleRepo          repository.RoleRepository
	PubKey            *rsa.PublicKey
	CORS              gin.HandlerFunc
}

func SetupRoutes(r *gin.Engine, h Handlers) {

	wellKnown := r.Group("/.well-known")
	{
		wellKnown.GET("/jwks.json", h.AuthHandler.GetJWKS)
	}

	v1Group := r.Group("api/v1")
	auth := v1Group.Group("/auth")
	{
		auth.GET("/authorize", h.AuthHandler.Authorize)
		auth.POST("/login", h.AuthHandler.LoginAndAuthorize)
		auth.POST("/token", h.AuthHandler.PostTokenExchange)
		auth.POST("/refresh", h.AuthHandler.PostTokenRotate)
		auth.POST("/logout", h.AuthHandler.Logout)
		auth.GET("/session", h.AuthHandler.CheckSession)
	}

	// Endpoint for getting user information
	me := v1Group.Group("/me")
	me.Use(middleware.AuthMiddleware(h.PubKey))
	me.GET("", h.UserHandler.GetMe)

	// Protected Admin Endpoints
	admin := v1Group.Group("/admin")
	admin.Use(middleware.AuthorizeRBAC(h.PubKey, h.UserRepo,
		h.RoleRepo))
	{
		admin.GET("/status", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "IdP is operational"})
		})

		// Service Provider (Client) Maintenance
		clients := admin.Group("/clients")
		{
			clients.POST("", h.ClientHandler.PostClient)
			clients.GET("", h.ClientHandler.GetClientList)
			clients.GET("/:id", h.ClientHandler.GetClient)

			clients.PUT("/:id", h.ClientHandler.PutClient)
			clients.PATCH("/:id/secret", h.ClientHandler.PatchClientSecret)
			clients.DELETE("/:id", h.ClientHandler.DeleteClient)
		}

		// Role Maintenance
		roles := admin.Group("/roles")
		{
			roles.POST("", h.RoleHandler.PostRole)
			roles.GET("", h.RoleHandler.GetRoleList)
			roles.GET("/:id", h.RoleHandler.GetRole)
			roles.GET("/all", h.RoleHandler.GetAllRoles)
			roles.PUT("/:id", h.RoleHandler.PutRole)
			roles.DELETE("/:id", h.RoleHandler.DeleteRole)
		}

		// User Maintenance
		users := admin.Group("/users")
		{
			users.POST("", h.UserHandler.PostUser)
			users.GET("", h.UserHandler.GetUserList)
			users.GET("/:id", h.UserHandler.GetUser)
			users.PATCH("/:id/status", h.UserHandler.PatchUserStatus)
			users.PATCH("/:id/password", h.UserHandler.PatchUserPassword)
			users.PATCH("/:id/roles", h.UserHandler.PatchUserRoles)
			users.DELETE("/:id", h.UserHandler.DeleteUser)
		}

		logs := admin.Group("/logs")
		{
			logs.GET("", h.LogHandler.GetLogList)
			logs.GET("/:id", h.LogHandler.GetLog)
		}

		permissions := admin.Group("/permissions")
		{
			permissions.GET("", h.PermissionHandler.GetAllPermissions)
		}
	}
}
