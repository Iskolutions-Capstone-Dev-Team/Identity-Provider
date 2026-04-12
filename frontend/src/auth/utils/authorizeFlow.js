import { DEFAULT_AUTHENTICATED_PATH } from "./authAccess";

const DEFAULT_CLIENT_ID = import.meta.env.VITE_CLIENT_ID ?? "";
const AUTHORIZE_RETURN_PATH_STORAGE_KEY = "authorizeReturnPath";
const NON_RETURNABLE_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/register/set-password",
  "/callback",
  "/logout",
  "/error",
]);

function normalizeClientId(clientId = DEFAULT_CLIENT_ID) {
  return typeof clientId === "string" ? clientId.trim() : "";
}

function normalizeApiBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

  return typeof apiBaseUrl === "string"
    ? apiBaseUrl.trim().replace(/\/$/, "")
    : "";
}

function normalizeReturnPath(path = DEFAULT_AUTHENTICATED_PATH) {
  if (typeof path !== "string") {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  const normalizedPath = path.trim();

  if (
    !normalizedPath ||
    !normalizedPath.startsWith("/") ||
    normalizedPath.startsWith("//")
  ) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  const pathname = normalizedPath.split(/[?#]/)[0];

  if (NON_RETURNABLE_PATHS.has(pathname)) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  return normalizedPath;
}

export function getCurrentReturnPath() {
  if (typeof window === "undefined") {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  return normalizeReturnPath(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
  );
}

export function rememberAuthorizeReturnPath(path = DEFAULT_AUTHENTICATED_PATH) {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.setItem(
    AUTHORIZE_RETURN_PATH_STORAGE_KEY,
    normalizeReturnPath(path),
  );
}

export function getAuthorizeReturnPath() {
  if (typeof sessionStorage === "undefined") {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  return normalizeReturnPath(
    sessionStorage.getItem(AUTHORIZE_RETURN_PATH_STORAGE_KEY) ??
      DEFAULT_AUTHENTICATED_PATH,
  );
}

export function clearAuthorizeReturnPath() {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.removeItem(AUTHORIZE_RETURN_PATH_STORAGE_KEY);
}

export function consumeAuthorizeReturnPath() {
  const returnPath = getAuthorizeReturnPath();

  clearAuthorizeReturnPath();

  return returnPath;
}

export function buildAuthorizeUrl(clientId = DEFAULT_CLIENT_ID) {
  const normalizedClientId = normalizeClientId(clientId);
  const apiBaseUrl = normalizeApiBaseUrl();

  if (!normalizedClientId || !apiBaseUrl) {
    return "";
  }

  const params = new URLSearchParams({
    client_id: normalizedClientId,
  });

  return `${apiBaseUrl}/auth/authorize?${params.toString()}`;
}

export function redirectToAuthorize( clientId = DEFAULT_CLIENT_ID, returnPath = DEFAULT_AUTHENTICATED_PATH ) {
  if (typeof window === "undefined") {
    return false;
  }

  const authorizeUrl = buildAuthorizeUrl(clientId);

  if (!authorizeUrl) {
    return false;
  }

  rememberAuthorizeReturnPath(returnPath);
  window.location.replace(authorizeUrl);

  return true;
}