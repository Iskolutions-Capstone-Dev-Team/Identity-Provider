const defaultClientId = import.meta.env.VITE_CLIENT_ID ?? "";
const LOGIN_ERROR_QUERY_PARAM = "auth_error";
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
  const { authError = "" } = options;

  if (authError === LOGIN_ERROR_CODES.UNAUTHORIZED) {
    return buildAccessDeniedPath(clientId);
  }

  const params = new URLSearchParams();

  if (clientId) {
    params.set("client_id", clientId);
  }

  if (authError) {
    params.set(LOGIN_ERROR_QUERY_PARAM, authError);
  }

  const queryString = params.toString();

  return queryString ? `${LOGIN_PATH}?${queryString}` : LOGIN_PATH;
}

export function buildAccessDeniedPath(clientId = defaultClientId) {
  const params = new URLSearchParams();

  if (clientId) {
    params.set("client_id", clientId);
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

export function getLoginErrorCode(searchParams) {
  return searchParams.get(LOGIN_ERROR_QUERY_PARAM)?.trim() ?? "";
}

export function getLoginErrorMessageByCode(errorCode = "") {
  return LOGIN_ERROR_MESSAGES[errorCode] ?? "";
}

export function getLoginErrorMessage(searchParams) {
  return getLoginErrorMessageByCode(getLoginErrorCode(searchParams));
}