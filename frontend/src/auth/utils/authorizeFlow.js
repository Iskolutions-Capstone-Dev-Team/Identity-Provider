import { DEFAULT_AUTHENTICATED_PATH } from "./authAccess";

const DEFAULT_CLIENT_ID = import.meta.env.VITE_CLIENT_ID ?? "";
const IDP_STORAGE_PREFIX = "idp";
const AUTHORIZE_RETURN_PATH_STORAGE_KEY =
  `${IDP_STORAGE_PREFIX}.authorizeReturnPath`;
const AUTHORIZE_ATTEMPT_STORAGE_KEY =
  `${IDP_STORAGE_PREFIX}.authorizeAttempt`;
const AUTHORIZE_ATTEMPT_WINDOW_MS = 5000;
const NON_RETURNABLE_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/register/set-password",
  "/callback",
  "/logout",
  "/error",
  "/mfa",
  "/mfa/setup",
  "/mfa/setup/confirm",
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

function readAuthorizeAttempt() {
  if (typeof sessionStorage === "undefined") {
    return null;
  }

  try {
    const rawValue = sessionStorage.getItem(AUTHORIZE_ATTEMPT_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    const timestamp = Number(parsedValue?.timestamp);
    const clientId = normalizeClientId(parsedValue?.clientId);

    if (!Number.isFinite(timestamp) || !clientId) {
      return null;
    }

    return {
      timestamp,
      clientId,
    };
  } catch (error) {
    console.error("Unable to read authorize attempt:", error);
    return null;
  }
}

function rememberAuthorizeAttempt(clientId = DEFAULT_CLIENT_ID) {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  const normalizedClientId = normalizeClientId(clientId);

  if (!normalizedClientId) {
    return;
  }

  sessionStorage.setItem(
    AUTHORIZE_ATTEMPT_STORAGE_KEY,
    JSON.stringify({
      clientId: normalizedClientId,
      timestamp: Date.now(),
    }),
  );
}

export function clearAuthorizeAttempt() {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.removeItem(AUTHORIZE_ATTEMPT_STORAGE_KEY);
}

export function hasRecentAuthorizeAttempt(clientId = DEFAULT_CLIENT_ID) {
  const normalizedClientId = normalizeClientId(clientId);
  const attempt = readAuthorizeAttempt();

  if (!normalizedClientId || !attempt) {
    return false;
  }

  if (attempt.clientId !== normalizedClientId) {
    return false;
  }

  return Date.now() - attempt.timestamp < AUTHORIZE_ATTEMPT_WINDOW_MS;
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

  const normalizedClientId = normalizeClientId(clientId);
  const authorizeUrl = buildAuthorizeUrl(clientId);

  if (!normalizedClientId || !authorizeUrl) {
    return false;
  }

  if (hasRecentAuthorizeAttempt(normalizedClientId)) {
    return false;
  }

  rememberAuthorizeReturnPath(returnPath);
  rememberAuthorizeAttempt(normalizedClientId);
  window.location.replace(authorizeUrl);

  return true;
}