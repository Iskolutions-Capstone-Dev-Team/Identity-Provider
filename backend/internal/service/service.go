package service

type ServiceContainer struct {
	ClientService *ClientService
	RoleService   *RoleService
	UserService   *UserService
	AuthService   *AuthService
	LogService    *LogService
	OTPService    *OTPService
}
