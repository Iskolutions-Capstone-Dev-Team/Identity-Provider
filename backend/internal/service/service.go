package service

type ServiceContainer struct {
	ClientService            ClientService
	RoleService              RoleService
	UserService              UserService
	AuthService              AuthService
	LogService               LogService
	PermissionService        PermissionService
	ClientAllowedUserService ClientAllowedUserService
}
