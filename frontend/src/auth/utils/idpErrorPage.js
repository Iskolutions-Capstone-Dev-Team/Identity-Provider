export const IDP_ERROR_PAGE_PATH = "/error";

const DEFAULT_IDP_RETURN_PATH = "/user-pool";
const DEFAULT_IDP_ERROR_MESSAGE = "Unauthorized access.";
const IDP_ERROR_RETURN_PATH_STORAGE_KEY = "idpErrorReturnPath";
const IDP_ERROR_MESSAGE_STORAGE_KEY = "idpErrorMessage";
const IDP_PROTECTED_PATHS = new Set([
  "/user-pool",
  "/roles",
  "/app-client",
  "/profile",
  "/audit-logs",
]);

function normalizeErrorMessage(message) {
  if (typeof message === "string") {
    return message.trim();
  }

  if (Array.isArray(message)) {
    return message
      .map((item) => normalizeErrorMessage(item))
      .filter(Boolean)
      .join(" ");
  }

  if (message && typeof message === "object") {
    return (
      normalizeErrorMessage(message.message) ||
      normalizeErrorMessage(message.error) ||
      normalizeErrorMessage(message.detail) ||
      normalizeErrorMessage(message.msg) ||
      ""
    );
  }

  return "";
}

export function extractIdpErrorMessage(error) {
  const responseData = error?.response?.data;

  return (
    normalizeErrorMessage(responseData?.message) ||
    normalizeErrorMessage(responseData?.error) ||
    normalizeErrorMessage(responseData?.detail) ||
    normalizeErrorMessage(responseData?.error_description) ||
    normalizeErrorMessage(responseData) ||
    normalizeErrorMessage(error?.message)
  );
}

export function isIdpProtectedPath(pathname = "") {
  return IDP_PROTECTED_PATHS.has(pathname);
}

export function rememberIdpErrorReturnPath(path = "") {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  const normalizedPath = typeof path === "string" ? path.trim() : "";

  if (!normalizedPath || normalizedPath === IDP_ERROR_PAGE_PATH) {
    return;
  }

  sessionStorage.setItem(IDP_ERROR_RETURN_PATH_STORAGE_KEY, normalizedPath);
}

export function getIdpErrorReturnPath() {
  if (typeof sessionStorage === "undefined") {
    return DEFAULT_IDP_RETURN_PATH;
  }

  return (
    sessionStorage.getItem(IDP_ERROR_RETURN_PATH_STORAGE_KEY) ||
    DEFAULT_IDP_RETURN_PATH
  );
}

export function clearIdpErrorReturnPath() {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.removeItem(IDP_ERROR_RETURN_PATH_STORAGE_KEY);
}

export function rememberIdpErrorMessage(message = "") {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  const normalizedMessage = normalizeErrorMessage(message);

  if (!normalizedMessage) {
    sessionStorage.removeItem(IDP_ERROR_MESSAGE_STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(IDP_ERROR_MESSAGE_STORAGE_KEY, normalizedMessage);
}

export function getIdpErrorMessage() {
  if (typeof sessionStorage === "undefined") {
    return DEFAULT_IDP_ERROR_MESSAGE;
  }

  return (
    sessionStorage.getItem(IDP_ERROR_MESSAGE_STORAGE_KEY) ||
    DEFAULT_IDP_ERROR_MESSAGE
  );
}

export function clearIdpErrorMessage() {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.removeItem(IDP_ERROR_MESSAGE_STORAGE_KEY);
}

export function redirectToIdpErrorPage(error) {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname === IDP_ERROR_PAGE_PATH) {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  rememberIdpErrorReturnPath(currentPath);
  rememberIdpErrorMessage(extractIdpErrorMessage(error));
  window.location.replace(IDP_ERROR_PAGE_PATH);
}