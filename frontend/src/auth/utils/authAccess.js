export const DEFAULT_AUTHENTICATED_PATH = "/user-pool";

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
  if (!Array.isArray(roles)) {
    return [];
  }

  return Array.from(new Set(roles.map(normalizeRoleName).filter(Boolean)));
}

export function hasAssignedRoles(user = {}) {
  return getAssignedRoleNames(user?.roles).length > 0;
}