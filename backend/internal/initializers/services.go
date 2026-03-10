package initializers

import (
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/jmoiron/sqlx"
)

func InitializeServices(db *sqlx.DB) service.ServiceContainer {
	// authRepo := repository.NewAuthCodeRepository(db)
	// sessionRepo := repository.NewSessionRepository(db)
	clientRepo := repository.NewClientRepository(db)
	roleRepo := repository.NewRoleRepository(db)
	userRepo := repository.NewUserRepository(db)

	return service.ServiceContainer{
		ClientService: &service.ClientService{
			Repo:    clientRepo,
			Storage: Storage,
		},
		RoleService: &service.RoleService{
			RoleRepo:   roleRepo,
			ClientRepo: clientRepo,
		},
		UserService: &service.UserService{
			Repo: userRepo,
			ClientRepo: clientRepo,
		},
	}
}
