export const DEFAULT_AUTHENTICATED_PATH = "/user-pool";

function normalizeRoleSource(roles) {
  if (Array.isArray(roles)) {
    return roles;
  }

  if (roles === null || roles === undefined) {
    return [];
  }

  return [roles];
}

function getUserRoleSource(user = {}) {
  return [
    ...normalizeRoleSource(user?.roles),
    ...normalizeRoleSource(user?.role),
    user?.role_name,
    user?.roleName,
  ];
}

function normalizeRoleName(role) {
  if (typeof role === "string") {
    return role.trim();
  }

  return (
    role?.role_name?.trim() ||
    role?.roleName?.trim() ||
    role?.name?.trim() ||
    role?.label?.trim() ||
    ""
  );
}

export function getAssignedRoleNames(roles = []) {
  const normalizedRoles = normalizeRoleSource(roles);

  return Array.from(
    new Set(normalizedRoles.map(normalizeRoleName).filter(Boolean)),
  );
}

export function hasAssignedRoles(user = {}) {
  return getAssignedRoleNames(getUserRoleSource(user)).length > 0;
}