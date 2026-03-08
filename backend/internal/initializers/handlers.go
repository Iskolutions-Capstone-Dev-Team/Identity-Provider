package initializers

import (
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api"
	v1 "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/jmoiron/sqlx"
)

func InitializeHandlers(db *sqlx.DB) *api.Handlers {
	authRepo := repository.NewAuthCodeRepository(db)
	sessionRepo := repository.NewSessionRepository(db)
	clientRepo := repository.NewClientRepository(db)
	roleRepo := repository.NewRoleRepository(db)
	userRepo := repository.NewUserRepository(db)

	mw := &middleware.Middleware{ClientRepo: clientRepo}

	return &api.Handlers{
		AuthHandler: &v1.AuthHandler{
			Repo:        authRepo,
			SessionRepo: sessionRepo,
			ClientRepo:  clientRepo,
			PrivateKey:  PrivKey,
			PublicKey:   PubKey,
		},
		ClientHandler: &v1.ClientHandler{
			Repo:       clientRepo,
			PrivateKey: PrivKey,
			Storage:    Storage,
		},
		RoleHandler: &v1.RoleHandler{
			Repo:       roleRepo,
			ClientRepo: clientRepo,
		},
		UserHandler: &v1.UserHandler{
			Repo: userRepo,
		},
		PubKey: PubKey,
		CORS:   mw.CORSMiddleware(),
	}
}
