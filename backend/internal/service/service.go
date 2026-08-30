package service

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/cache"

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
	MFAService               MFAService
	PasskeyService           PasskeyService
	MetricsService           MetricsService
	ReportService            ReportService
	Cache                    cache.Cache
}
