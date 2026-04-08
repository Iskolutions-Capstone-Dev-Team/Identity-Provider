package initializers

import (
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/jmoiron/sqlx"
)

func InitializeServices(db *sqlx.DB) service.ServiceContainer {
	authRepo := repository.NewAuthCodeRepository(db)
	sessionRepo := repository.NewSessionRepository(db)
	clientRepo := repository.NewClientRepository(db)
	roleRepo := repository.NewRoleRepository(db)
	userRepo := repository.NewUserRepository(db)
	logRepo := repository.NewLogRepository(db)
	permissionRepo := repository.NewPermissionRepository(db)
	otpRepo := repository.NewOTPRepository(db)
	invRepo := repository.NewInvitationRepository(db)
	cauRepo := repository.NewClientAllowedUserRepository(db)
	registrationRepo := repository.NewRegistrationRepository(db)

	return service.ServiceContainer{
		ClientService: service.NewClientService(clientRepo, Storage),
		RoleService:   service.NewRoleService(roleRepo),
		UserService:   service.NewUserService(userRepo, clientRepo),
		AuthService: service.NewAuthService(
			authRepo,
			sessionRepo,
			clientRepo,
			PrivKey,
			PubKey,
		),
		LogService:        service.NewLogService(logRepo),
		PermissionService: service.NewPermissionService(permissionRepo),
		MailService:       service.NewMailService(otpRepo, invRepo),
		ClientAllowedUserService: service.NewClientAllowedUserService(
			cauRepo,
		),
		RegistrationService: service.NewRegistrationService(
			registrationRepo,
		),
	}
}


