export const IDP_ERROR_PAGE_PATH = "/error";

const DEFAULT_IDP_RETURN_PATH = "/user-pool";
const IDP_ERROR_RETURN_PATH_STORAGE_KEY = "idpErrorReturnPath";
const IDP_PROTECTED_PATHS = new Set([
  "/user-pool",
  "/roles",
  "/app-client",
  "/profile",
  "/audit-logs",
]);

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

export function redirectToIdpErrorPage() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname === IDP_ERROR_PAGE_PATH) {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  rememberIdpErrorReturnPath(currentPath);
  window.location.replace(IDP_ERROR_PAGE_PATH);
}
