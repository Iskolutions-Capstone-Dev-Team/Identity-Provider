import { normalizeRoleNames } from "../../../utils/userPoolAccess";
import { EDITABLE_STATUS_VALUES } from "../constants/userPoolConstants";

export function normalizeClientIds(clientIds = []) {
  return Array.from(
    new Set(
      (Array.isArray(clientIds) ? clientIds : [])
        .map((clientId) => (typeof clientId === "string" ? clientId.trim() : ""))
        .filter(Boolean),
    ),
  );
}

export function normalizeClientNames(clientNames = []) {
  return Array.from(
    new Set(
      (Array.isArray(clientNames) ? clientNames : [])
        .map((clientName) =>
          typeof clientName === "string" ? clientName.trim() : "",
        )
        .filter(Boolean),
    ),
  );
}

function getClientIdsFromList(clients = []) {
  return normalizeClientIds(
    (Array.isArray(clients) ? clients : []).map((client) => {
      if (typeof client === "string") {
        return client;
      }

      return client?.id ?? client?.client_id ?? client?.clientId ?? "";
    }),
  );
}

function getClientNamesFromList(clients = []) {
  return normalizeClientNames(
    (Array.isArray(clients) ? clients : []).map((client) => {
      if (typeof client === "string") {
        return "";
      }

      return client?.name ?? client?.client_name ?? client?.clientName ?? "";
    }),
  );
}

function getManagedClientIds(user = {}) {
  const directClientIds = normalizeClientIds(
    user?.managedAppClientIds ??
      user?.managed_appclient_ids ??
      user?.managed_app_client_ids ??
      user?.managedClientIds ??
      user?.managed_client_ids ??
      user?.manageableAppClientIds ??
      user?.manageable_appclient_ids ??
      user?.manageable_app_clients ??
      user?.manageClientIds ??
      user?.manage_client_ids ??
      user?.managedAppClients ??
      user?.managed_appclients ??
      user?.managed_app_clients ??
      user?.managedClients ??
      user?.managed_clients ??
      user?.manageableAppClients ??
      user?.manageable_appclients ??
      user?.manageable_app_client_ids ??
      user?.manageClients ??
      user?.manage_clients,
  );

  if (directClientIds.length > 0) {
    return directClientIds;
  }

  for (const clientList of [
    user?.managedAppClients,
    user?.managed_appclients,
    user?.managed_app_clients,
    user?.managedClients,
    user?.managed_clients,
    user?.manageableAppClients,
    user?.manageable_appclients,
    user?.manageable_app_clients,
    user?.manageClients,
    user?.manage_clients,
  ]) {
    const clientIds = getClientIdsFromList(clientList);

    if (clientIds.length > 0) {
      return clientIds;
    }
  }

  return [];
}

function getManagedClientNames(user = {}) {
  const directClientNames = normalizeClientNames(
    user?.managedAppClientNames ??
      user?.managed_appclient_names ??
      user?.managed_app_client_names ??
      user?.managedClientNames ??
      user?.managed_client_names ??
      user?.manageableAppClientNames ??
      user?.manageable_appclient_names ??
      user?.manageable_app_client_names ??
      user?.manageClientNames ??
      user?.manage_client_names,
  );

  if (directClientNames.length > 0) {
    return directClientNames;
  }

  for (const clientList of [
    user?.managedAppClients,
    user?.managed_appclients,
    user?.managed_app_clients,
    user?.managedClients,
    user?.managed_clients,
    user?.manageableAppClients,
    user?.manageable_appclients,
    user?.manageable_app_clients,
    user?.manageClients,
    user?.manage_clients,
  ]) {
    const clientNames = getClientNamesFromList(clientList);

    if (clientNames.length > 0) {
      return clientNames;
    }
  }

  return [];
}

export function normalizeEmailAddress(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function getAccessibleClientIds(user = {}) {
  const directClientIds = normalizeClientIds(
    user?.accessibleClientIds ??
      user?.accessible_client_ids ??
      user?.allowedAppClientIds ??
      user?.allowed_appclient_ids ??
      user?.allowedAppClients ??
      user?.allowed_appclients ??
      user?.clientIds ??
      user?.client_ids,
  );

  if (directClientIds.length > 0) {
    return directClientIds;
  }

  for (const clientList of [
    user?.clients,
    user?.allowedAppClients,
    user?.allowed_appclients,
  ]) {
    const clientIds = getClientIdsFromList(clientList);

    if (clientIds.length > 0) {
      return clientIds;
    }
  }

  return [];
}

function getAccessibleClientNames(user = {}) {
  const directClientNames = normalizeClientNames(
    user?.accessibleClientNames ??
      user?.accessible_client_names ??
      user?.allowedAppClientNames ??
      user?.allowed_appclient_names ??
      user?.clientNames ??
      user?.client_names,
  );

  if (directClientNames.length > 0) {
    return directClientNames;
  }

  for (const clientList of [
    user?.clients,
    user?.allowedAppClients,
    user?.allowed_appclients,
  ]) {
    const clientNames = getClientNamesFromList(clientList);

    if (clientNames.length > 0) {
      return clientNames;
    }
  }

  return [];
}

export function areSameArrays(first = [], second = []) {
  const normalizedFirst = [...first].sort();
  const normalizedSecond = [...second].sort();

  if (normalizedFirst.length !== normalizedSecond.length) {
    return false;
  }

  return normalizedFirst.every((value, index) => value === normalizedSecond[index]);
}

export function normalizeStatus(status) {
  if (typeof status !== "string") {
    return "";
  }

  const normalizedStatus = status.trim().toLowerCase();
  return EDITABLE_STATUS_VALUES.has(normalizedStatus) ? normalizedStatus : "";
}

export function normalizeRoleId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalizedValue = Number.parseInt(value, 10);
  return Number.isInteger(normalizedValue) && normalizedValue > 0
    ? normalizedValue
    : null;
}

export function normalizeAccountTypeId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalizedValue = Number.parseInt(value, 10);
  return Number.isInteger(normalizedValue) && normalizedValue > 0
    ? normalizedValue
    : null;
}

function getUserRoleId(user = {}) {
  const roleSource = Array.isArray(user?.roles) ? user.roles[0] : user?.roles;
  const roleCandidates = [
    user?.role_id,
    user?.roleId,
    roleSource?.id,
    user?.role?.id,
  ];

  for (const roleCandidate of roleCandidates) {
    const normalizedRoleId = normalizeRoleId(roleCandidate);

    if (normalizedRoleId !== null) {
      return normalizedRoleId;
    }
  }

  return null;
}

export function getUserIdKey(user = {}) {
  if (typeof user?.id !== "string") {
    return "";
  }

  const normalizedId = user.id.trim();
  return normalizedId ? `id:${normalizedId}` : "";
}

export function getUserEmailKey(user = {}) {
  if (typeof user?.email !== "string") {
    return "";
  }

  const normalizedEmail = user.email.trim().toLowerCase();
  return normalizedEmail ? `email:${normalizedEmail}` : "";
}

export function isStatusRequestError(error) {
  const errorMessage = error?.response?.data?.error || error?.message || "";
  return (
    typeof errorMessage === "string" &&
    errorMessage.toLowerCase().includes("status")
  );
}

export function mapUserResponse(user = {}, { isAdmin = false } = {}) {
  const givenName = user.first_name ?? "";
  const middleName = user.middle_name ?? "";
  const surname = user.last_name ?? "";
  const suffix =
    user.name_suffix ??
    user.suffix ??
    user.suffix_name ??
    user.suffixName ??
    "";
  const fullName = [givenName, middleName, surname, suffix]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id: user.id,
    email: user.email,
    accountTypeId: normalizeAccountTypeId(
      user.account_type_id ?? user.accountTypeId ?? user.accountType?.id,
    ),
    accountType:
      user.account_type ??
      user.accountType ??
      user.account_type_name ??
      user.accountTypeName ??
      "",
    givenName,
    middleName,
    surname,
    suffix,
    displayName: fullName || user.email || "User",
    status: user.status,
    createdAt: user.created_at,
    roleId: getUserRoleId(user),
    roles: normalizeRoleNames(user.roles),
    accessibleClientIds: getAccessibleClientIds(user),
    accessibleClientNames: getAccessibleClientNames(user),
    manageableClientIds: getManagedClientIds(user),
    manageableClientNames: getManagedClientNames(user),
    isAdmin,
  };
}

export function getUserDetailPayload(response = {}) {
  return response?.user ?? response?.data?.user ?? response?.data ?? response;
}

export function applyUserClientSelections(
  users,
  accessSelections = {},
  manageableSelections = {},
) {
  return users.map((user) => {
    const userIdKey = getUserIdKey(user);
    const userEmailKey = getUserEmailKey(user);
    const accessibleClientIds =
      accessSelections[userIdKey] ??
      accessSelections[userEmailKey] ??
      user.accessibleClientIds ??
      [];
    const manageableClientIds =
      manageableSelections[userIdKey] ??
      manageableSelections[userEmailKey] ??
      user.manageableClientIds ??
      [];

    return {
      ...user,
      accessibleClientIds: normalizeClientIds(accessibleClientIds),
      manageableClientIds: normalizeClientIds(manageableClientIds),
    };
  });
}
