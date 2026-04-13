const DEFAULT_CLIENT_ID = import.meta.env.VITE_CLIENT_ID ?? "";
const LOGOUT_PATH = "/logout";

function normalizeTextValue(value = "") {
  return typeof value === "string" ? value.trim() : "";
}

export function buildLogoutPath({ clientId = DEFAULT_CLIENT_ID, userId = "" } = {}) {
  const params = new URLSearchParams();
  const normalizedClientId = normalizeTextValue(clientId);
  const normalizedUserId = normalizeTextValue(userId);

  if (normalizedClientId) {
    params.set("client_id", normalizedClientId);
  }

  if (normalizedUserId) {
    params.set("user_id", normalizedUserId);
  }

  const queryString = params.toString();

  return queryString ? `${LOGOUT_PATH}?${queryString}` : LOGOUT_PATH;
}

export function getLogoutClientId(searchParams) {
  return normalizeTextValue(searchParams?.get("client_id")) || DEFAULT_CLIENT_ID;
}

export function getLogoutUserId(searchParams) {
  return normalizeTextValue(searchParams?.get("user_id"));
}