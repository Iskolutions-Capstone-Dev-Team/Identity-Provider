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
	cauRepo := repository.NewClientAllowedUserRepository(db)

	return service.ServiceContainer{
		ClientService: service.NewClientService(clientRepo, Storage),
		RoleService:   service.NewRoleService(roleRepo),
		UserService:   service.NewUserService(userRepo),
		AuthService: service.NewAuthService(
			authRepo,
			sessionRepo,
			clientRepo,
			PrivKey,
			PubKey,
		),
		LogService:        service.NewLogService(logRepo),
		PermissionService: service.NewPermissionService(permissionRepo),
		ClientAllowedUserService: service.NewClientAllowedUserService(
			cauRepo,
		),
	}
}


