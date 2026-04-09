package service

type ServiceContainer struct {
	ClientService            ClientService
	RoleService              RoleService
	UserService              UserService
	AuthService              AuthService
	LogService               LogService
	PermissionService        PermissionService
	MailService              MailService
	ClientAllowedUserService ClientAllowedUserService
	RegistrationService      RegistrationService
	OTPService               OTPService
}
