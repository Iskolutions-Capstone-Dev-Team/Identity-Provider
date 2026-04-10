export const PERMISSIONS = Object.freeze({
  ADD_USER: "Add user",
  EDIT_USER: "Edit user",
  DELETE_USER: "Delete user",
  VIEW_ALL_USERS: "View all users",
  VIEW_USERS_BY_APPCLIENT: "View users based on appclient",
  APPROVE_REGISTRATION_REQUEST: "Approve registration request",
  REJECT_REGISTRATION_REQUEST: "Reject registration request",
  VIEW_REGISTRATION_REQUESTS: "View registration requests",
  ADD_APPCLIENT: "Add appclient",
  EDIT_APPCLIENT: "Edit appclient",
  DELETE_APPCLIENT: "Delete appclient",
  VIEW_ALL_APPCLIENTS: "View all appclients",
  VIEW_ROLES: "View roles",
  ASSIGN_ROLES: "Assign Roles",
  EDIT_ROLES: "Edit Roles",
  DELETE_ROLES: "Delete Roles",
  ADD_ROLES: "Add Roles",
  ASSIGN_APPCLIENT_TO_USER: "Assign appclient to user",
  REMOVE_APPCLIENT_FROM_USER: "Remove appclient from user",
  REMOVE_ROLES: "Remove Roles",
  SUSPEND_USER: "Suspend user",
  ACTIVATE_USER: "Activate user",
  VIEW_AUDIT_LOGS: "View audit logs",
  VIEW_SECURITY_LOGS: "View security logs",
});

export const USER_POOL_PAGE_PERMISSIONS = Object.freeze([
  PERMISSIONS.VIEW_ALL_USERS,
  PERMISSIONS.VIEW_USERS_BY_APPCLIENT,
]);

export const USER_STATUS_EDIT_PERMISSIONS = Object.freeze([
  PERMISSIONS.EDIT_USER,
  PERMISSIONS.ACTIVATE_USER,
  PERMISSIONS.SUSPEND_USER,
]);

export const USER_ROLE_EDIT_PERMISSIONS = Object.freeze([
  PERMISSIONS.ASSIGN_ROLES,
  PERMISSIONS.REMOVE_ROLES,
]);

export const USER_ACCESS_EDIT_PERMISSIONS = Object.freeze([
  PERMISSIONS.ASSIGN_APPCLIENT_TO_USER,
  PERMISSIONS.REMOVE_APPCLIENT_FROM_USER,
]);

export const REGISTRATION_PAGE_PERMISSIONS = Object.freeze([
  PERMISSIONS.VIEW_REGISTRATION_REQUESTS,
  PERMISSIONS.APPROVE_REGISTRATION_REQUEST,
  PERMISSIONS.REJECT_REGISTRATION_REQUEST,
]);

export const REGISTRATION_EDIT_PERMISSIONS = Object.freeze([
  PERMISSIONS.APPROVE_REGISTRATION_REQUEST,
  PERMISSIONS.REJECT_REGISTRATION_REQUEST,
]);

export const ROUTE_PERMISSIONS = Object.freeze({
  "/user-pool": USER_POOL_PAGE_PERMISSIONS,
  "/roles": [PERMISSIONS.VIEW_ROLES],
  "/app-client": [PERMISSIONS.VIEW_ALL_APPCLIENTS],
  "/audit-logs": [PERMISSIONS.VIEW_AUDIT_LOGS],
  "/registration": REGISTRATION_PAGE_PERMISSIONS,
});

const DEFAULT_ACCESSIBLE_PATHS = [
  "/user-pool",
  "/roles",
  "/app-client",
  "/audit-logs",
  "/registration",
  "/profile",
];

function normalizePermissionName(permission) {
  return typeof permission === "string" ? permission.trim().toLowerCase() : "";
}

export function createPermissionLookup(permissions = []) {
  return new Set(
    (Array.isArray(permissions) ? permissions : [])
      .map((permission) => normalizePermissionName(permission))
      .filter(Boolean),
  );
}

export function hasPermission(permissionLookup, permission) {
  const normalizedPermission = normalizePermissionName(permission);

  if (!normalizedPermission) {
    return false;
  }

  return permissionLookup.has(normalizedPermission);
}

export function hasAnyPermission(permissionLookup, requiredPermissions = []) {
  if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
    return true;
  }

  return requiredPermissions.some((permission) =>
    hasPermission(permissionLookup, permission),
  );
}

export function canAccessPath(pathname = "", permissionLookup) {
  return hasAnyPermission(permissionLookup, ROUTE_PERMISSIONS[pathname]);
}

export function getFirstAccessiblePath(permissionLookup) {
  return (
    DEFAULT_ACCESSIBLE_PATHS.find((path) =>
      canAccessPath(path, permissionLookup),
    ) || "/profile"
  );
}