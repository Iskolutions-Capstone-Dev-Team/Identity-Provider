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
	LogHandler          *v1.LogHandler
	AuthHandler         *v1.AuthHandler
	ClientHandler       *v1.ClientHandler
	RoleHandler         *v1.RoleHandler
	UserHandler         *v1.UserHandler
	PermissionHandler   *v1.PermissionHandler
	MailHandler         *v1.MailHandler
	RegistrationHandler *v1.RegistrationHandler
	OTPHandler          *v1.OTPHandler
	UserRepo            repository.UserRepository

	RoleRepo repository.RoleRepository
	PubKey   *rsa.PublicKey
	CORS     gin.HandlerFunc
	ClientCORS gin.HandlerFunc
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

	v1Group.POST("/activate", h.RegistrationHandler.ActivateAccount)
	v1Group.GET("/activate/:code", h.RegistrationHandler.CheckInvitation)

	// Endpoint for getting user information
	me := v1Group.Group("/me")
	me.Use(middleware.AuthMiddleware(h.PubKey, h.LogHandler.LogService))
	me.GET("", h.UserHandler.GetMe)

	otp := v1Group.Group("/otp")
	{
		otp.POST("/send", h.OTPHandler.SendOTP)
		otp.POST("/verify", h.OTPHandler.VerifyOTP)
	}

	user := v1Group.Group("/user")
	user.Use(middleware.APIKeyMiddleware())
	{
		user.POST("", h.UserHandler.PostUser)
		user.PATCH("/:id/name", h.UserHandler.PatchUserName)
		user.PATCH("/password/forgot", h.UserHandler.PatchUserPasswordByEmail)
		user.PATCH("/password/change",
			middleware.AuthMiddleware(h.PubKey, h.LogHandler.LogService),
			h.UserHandler.PatchChangePassword)
	}

	internalUser := v1Group.Group("/internal/user")
	internalUser.Use(h.ClientCORS)
	{
		internalUser.POST("", h.UserHandler.PostUser)
		internalUser.PATCH("/:id/name", h.UserHandler.PatchUserName)
		internalUser.PATCH("/:id/password", h.UserHandler.PatchUserPassword)
		internalUser.PATCH(
			"/password/forgot",
			h.UserHandler.PatchUserPasswordByEmail,
		)
		internalUser.PATCH(
			"/password/change",
			middleware.AuthMiddleware(h.PubKey, h.LogHandler.LogService),
			h.UserHandler.PatchChangePassword,
		)
	}

	v1Group.GET("/users/access",
		middleware.AuthMiddleware(h.PubKey, h.LogHandler.LogService),
		middleware.APIKeyMiddleware(),
		h.UserHandler.GetUserDetailedAccess)


	// Protected Admin Endpoints
	admin := v1Group.Group("/admin")
	admin.Use(middleware.AuthorizeRBAC(h.PubKey, h.UserRepo,
		h.RoleRepo, h.LogHandler.LogService))
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
			users.GET("/admins", h.UserHandler.GetAdminUserList)
			users.GET("/:id", h.UserHandler.GetUser)
			users.PATCH("/:id/status", h.UserHandler.PatchUserStatus)
			users.PATCH("/:id/role", h.UserHandler.PatchUserRole)
			users.GET("/access", h.UserHandler.GetUserAccess)
			users.PUT("/:id/access", h.UserHandler.PutUserAccess)
			users.DELETE("/:id", h.UserHandler.DeleteUser)
		}

		logs := admin.Group("/logs")
		{
			logs.GET("", h.LogHandler.GetLogList)
			logs.GET("/security", h.LogHandler.GetSecurityLogList)
			logs.GET("/security/:id", h.LogHandler.GetSecurityLog)
			logs.GET("/:id", h.LogHandler.GetLog)
		}

		permissions := admin.Group("/permissions")
		{
			permissions.GET("/all", h.PermissionHandler.GetAllPermissions)

			protectedPerms := permissions.Group("")
			protectedPerms.Use(middleware.AuthMiddleware(
				h.PubKey,
				h.LogHandler.LogService,
			))
			{
				protectedPerms.GET("", h.PermissionHandler.GetUserPermissions)
			}
		}

		mail := admin.Group("/mail")
		{
			mail.POST("/invitation", h.MailHandler.SendInvitation)
		}

		registrationAdmin := admin.Group("/registration")
		{
			registrationAdmin.GET(
				"/config",
				h.RegistrationHandler.GetRegistrationConfig,
			)
			registrationAdmin.PUT(
				"/preapproved",
				h.RegistrationHandler.UpdatePreapprovedClients,
			)
			registrationAdmin.GET(
				"/config/:id",
				h.RegistrationHandler.GetClientsByAccountTypeID,
			)
		}
	}
}
