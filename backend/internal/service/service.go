package service

type ServiceContainer struct {
	ClientService    *ClientService
	RoleService      *RoleService
	UserService      *UserService
	AuthService      *AuthService
	PrivilegeService *PrivilegeService
	LogService       *LogService
}
