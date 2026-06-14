package initializers

import (
	"context"
	"log"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/cache"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

func InitializeServices(db *sqlx.DB) service.ServiceContainer {
	var appCache cache.Cache = cache.NewNoopCache()

	if redisURL := os.Getenv("REDIS_URL"); redisURL != "" {
		opt, err := redis.ParseURL(redisURL)
		if err != nil {
			log.Printf("[InitializeServices] Redis URL parse warning: %v", err)
		} else {
			redisClient := redis.NewClient(opt)
			err = redisClient.Ping(context.Background()).Err()
			if err != nil {
				log.Printf("[InitializeServices] Redis connection failure: %v", err)
			} else {
				appCache = cache.NewRedisCache(redisClient)
				log.Println("[InitializeServices] Redis cache successfully initialized")
			}
		}
	} else {
		log.Println("[InitializeServices] REDIS_URL not set; using no-op cache")
	}

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
	passkeyRepo := repository.NewPasskeyRepository(db)
	metricsRepo := repository.NewMetricsRepository(db)

	userSvc := service.NewUserService(
		userRepo,
		clientRepo,
		registrationRepo,
		cauRepo,
		appCache,
	)

	passkeySvc, err := service.NewPasskeyService(
		passkeyRepo,
		userSvc,
		clientRepo,
	)
	if err != nil {
		panic(err)
	}

	return service.ServiceContainer{
		ClientService: service.NewClientService(clientRepo, Storage, appCache),
		RoleService:   service.NewRoleService(roleRepo, appCache),
		UserService:   userSvc,
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
			invRepo,
			userRepo,
			cauRepo,
		),
		OTPService: service.NewOTPService(
			otpRepo,
			service.NewMailService(otpRepo, invRepo),
		),
		MFAService:     service.NewMFAService(repository.NewMFARepository(db)),
		PasskeyService: passkeySvc,
		MetricsService: service.NewMetricsService(metricsRepo, appCache),
	}
}
