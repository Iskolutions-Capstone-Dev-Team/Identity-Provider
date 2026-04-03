export const REGULAR_USER_TYPE = "regular";
export const ADMIN_USER_TYPE = "admin";

const ADMIN_ROLE_NAMES = new Set(["idp:admin", "idp:superadmin"]);

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeLowerText = (value) => normalizeText(value).toLowerCase();

export function normalizeRoleNames(roles = []) {
  return Array.from(
    new Set(
      (Array.isArray(roles) ? roles : [])
        .map((role) => {
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
        })
        .filter(Boolean),
    ),
  );
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (["true", "1", "yes"].includes(normalizedValue)) {
      return true;
    }

    if (["false", "0", "no"].includes(normalizedValue)) {
      return false;
    }
  }

  return null;
}

export function isAdminRoleName(roleName) {
  return ADMIN_ROLE_NAMES.has(normalizeLowerText(roleName));
}

export function resolveUserIsAdmin(user = {}) {
  const explicitIsAdmin = normalizeBoolean(user?.is_admin ?? user?.isAdmin);

  if (explicitIsAdmin !== null) {
    return explicitIsAdmin;
  }

  return normalizeRoleNames(user?.roles).some((roleName) =>
    isAdminRoleName(roleName),
  );
}

function normalizeAppClientName(client = {}) {
  return (
    normalizeText(client?.name) ||
    normalizeText(client?.client_name) ||
    normalizeText(client?.label) ||
    normalizeText(client?.tag)
  );
}

export function getAccessibleAppClientsForRoles(roleNames = [], appClients = []) {
  const normalizedRoleLookup = new Set(
    normalizeRoleNames(roleNames).map((roleName) => normalizeLowerText(roleName)),
  );

  if (normalizedRoleLookup.size === 0) {
    return [];
  }

  return (Array.isArray(appClients) ? appClients : []).filter((client) =>
    normalizeRoleNames(client?.roleNames).some((roleName) =>
      normalizedRoleLookup.has(normalizeLowerText(roleName)),
    ),
  );
}

export function getAccessibleAppClientNames(roleNames = [], appClients = []) {
  return getAccessibleAppClientsForRoles(roleNames, appClients)
    .map((client) => normalizeAppClientName(client))
    .filter(Boolean);
}

export function getAccessibleAppClientIds(roleNames = [], appClients = []) {
  return getAccessibleAppClientsForRoles(roleNames, appClients)
    .map((client) => client?.id)
    .filter(Boolean);
}

export function deriveRolesFromAppClients( selectedClientIds = [], appClients = [], availableRoles = [] ) {
  const selectedClientLookup = new Set(
    (Array.isArray(selectedClientIds) ? selectedClientIds : []).filter(Boolean),
  );
  const matchedRoleNames = [];

  (Array.isArray(appClients) ? appClients : []).forEach((client) => {
    if (!selectedClientLookup.has(client?.id)) {
      return;
    }

    normalizeRoleNames(client?.roleNames).forEach((roleName) => {
      matchedRoleNames.push(roleName);
    });
  });

  const roleNameLookup = new Map(
    (Array.isArray(availableRoles) ? availableRoles : []).map((role) => [
      normalizeLowerText(role?.role_name),
      role,
    ]),
  );
  const uniqueRoleNames = Array.from(new Set(matchedRoleNames));
  const matchedRoles = uniqueRoleNames
    .map((roleName) => roleNameLookup.get(normalizeLowerText(roleName)))
    .filter(Boolean);

  return {
    roleIds: Array.from(
      new Set(
        matchedRoles
          .map((role) => role?.id)
          .filter((roleId) => Number.isInteger(roleId) && roleId > 0),
      ),
    ),
    roleNames: uniqueRoleNames,
  };
}

export function getAdminRoleOptions(roles = []) {
  return (Array.isArray(roles) ? roles : []).filter(
    (role) =>
      Number.isInteger(role?.id) &&
      role.id > 0 &&
      typeof role?.role_name === "string" &&
      role.role_name.trim().length > 0,
  );
}

export function getAppClientSelectOptions(appClients = []) {
  return (Array.isArray(appClients) ? appClients : [])
    .map((client) => ({
      id: client?.id,
      label: normalizeAppClientName(client),
    }))
    .filter((client) => client.id && client.label);
}