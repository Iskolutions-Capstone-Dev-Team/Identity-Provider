const defaultClientId = import.meta.env.VITE_CLIENT_ID ?? "";
const LOGIN_ERROR_QUERY_PARAM = "auth_error";
const LOGIN_MFA_QUERY_PARAM = "mfa";
const REDIRECT_URI_QUERY_PARAM = "redirect_uri";
export const LOGIN_PATH = "/login";
export const ACCESS_DENIED_PATH = "/access-denied";
export const LEGACY_UNAUTHORIZED_PATH = "/unauthorized";

export const LOGIN_ERROR_CODES = {
  UNAUTHORIZED: "unauthorized",
};

const LOGIN_ERROR_MESSAGES = {
  [LOGIN_ERROR_CODES.UNAUTHORIZED]:
    "Unauthorized to access this service.",
};

export function buildLoginPath(clientId = defaultClientId, options = {}) {
  const { authError = "", redirectUri = "", showMfa = false } = options;

  if (authError === LOGIN_ERROR_CODES.UNAUTHORIZED) {
    return buildAccessDeniedPath(clientId, { redirectUri });
  }

  const params = new URLSearchParams();

  if (clientId) {
    params.set("client_id", clientId);
  }

  if (redirectUri) {
    params.set(REDIRECT_URI_QUERY_PARAM, redirectUri);
  }

  if (authError) {
    params.set(LOGIN_ERROR_QUERY_PARAM, authError);
  }

  if (showMfa) {
    params.set(LOGIN_MFA_QUERY_PARAM, "1");
  }

  const queryString = params.toString();

  return queryString ? `${LOGIN_PATH}?${queryString}` : LOGIN_PATH;
}

export function buildAccessDeniedPath(clientId = defaultClientId, options = {}) {
  const { redirectUri = "" } = options;
  const params = new URLSearchParams();

  if (clientId) {
    params.set("client_id", clientId);
  }

  if (redirectUri) {
    params.set(REDIRECT_URI_QUERY_PARAM, redirectUri);
  }

  const queryString = params.toString();

  return queryString
    ? `${ACCESS_DENIED_PATH}?${queryString}`
    : ACCESS_DENIED_PATH;
}

export function buildUnauthorizedLoginPath(clientId = defaultClientId) {
  return buildAccessDeniedPath(clientId);
}

export function buildRegisterPasswordSetupPath( clientId = defaultClientId, email = "" ) {
  const params = new URLSearchParams();

  if (clientId) {
    params.set("client_id", clientId);
  }

  if (email) {
    params.set("email", email);
  }

  const queryString = params.toString();

  return queryString
    ? `/register/set-password?${queryString}`
    : "/register/set-password";
}

export function getLoginClientId(searchParams) {
  return searchParams.get("client_id") || defaultClientId;
}

export function getLoginRedirectUri(searchParams) {
  return searchParams.get(REDIRECT_URI_QUERY_PARAM)?.trim() ?? "";
}

export function getLoginErrorCode(searchParams) {
  return searchParams.get(LOGIN_ERROR_QUERY_PARAM)?.trim() ?? "";
}

export function getLoginErrorMessageByCode(errorCode = "") {
  return LOGIN_ERROR_MESSAGES[errorCode] ?? "";
}

export function getLoginErrorMessage(searchParams) {
  return getLoginErrorMessageByCode(getLoginErrorCode(searchParams));
}

export function isLoginMfaRequested(searchParams) {
  return searchParams.get(LOGIN_MFA_QUERY_PARAM) === "1";
}