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

	mw := &middleware.Middleware{ClientRepo: clientRepo}

	return &api.Handlers{
		AuthHandler: &v1.AuthHandler{
			AuthService: service.AuthService,
			LogService:  service.LogService,
		},
		ClientHandler: &v1.ClientHandler{
			Service:          service.ClientService,
			PrivilegeService: service.PrivilegeService,
		},
		RoleHandler: &v1.RoleHandler{
			Service:          service.RoleService,
			PrivilegeService: service.PrivilegeService,
		},
		UserHandler: &v1.UserHandler{
			Service:          service.UserService,
			PrivilegeService: service.PrivilegeService,
		},
		PubKey: PubKey,
		CORS:   mw.CORSMiddleware(),
	}
}
