package initializers

import (
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api"
	v1 "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/jmoiron/sqlx"
)

func InitializeHandlers(db *sqlx.DB,
	service *service.ServiceContainer,
) *api.Handlers {
	clientRepo := repository.NewClientRepository(db)
	userRepo := repository.NewUserRepository(db)
	roleRepo := repository.NewRoleRepository(db)

	mw := &middleware.Middleware{ClientRepo: clientRepo}

	return &api.Handlers{
		AuthHandler: &v1.AuthHandler{
			AuthService:   service.AuthService,
			LogService:    service.LogService,
			ClientService: service.ClientService,
		},
		ClientHandler: &v1.ClientHandler{
			Service:    service.ClientService,
			LogService: service.LogService,
		},
		RoleHandler: &v1.RoleHandler{
			Service:    service.RoleService,
			LogService: service.LogService,
		},
		UserHandler: &v1.UserHandler{
			Service:       service.UserService,
			LogService:    service.LogService,
			ClientService: service.ClientService,
			AccessService: service.ClientAllowedUserService,
		},

		LogHandler: &v1.LogHandler{
			LogService: service.LogService,
		},
		PermissionHandler: &v1.PermissionHandler{
			Service: service.PermissionService,
		},
		MailHandler: &v1.MailHandler{
			MailService: service.MailService,
			LogService:  service.LogService,
			OTPService:  service.OTPService,
		},
		RegistrationHandler: &v1.RegistrationHandler{
			Service:    service.RegistrationService,
			LogService: service.LogService,
		},
		OTPHandler: v1.NewOTPHandler(service.OTPService),
		UserRepo: userRepo,

		RoleRepo: roleRepo,
		PubKey:   PubKey,
		CORS:     mw.CORSMiddleware(),
	}
}

