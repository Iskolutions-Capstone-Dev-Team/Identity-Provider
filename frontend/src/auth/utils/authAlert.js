const AUTH_ALERT_STORAGE_KEY = "authAlertMessage";

const UNAUTHORIZED_ALERT_MESSAGE = "Your account is unauthorized to access this system.";

export function rememberUnauthorizedAlert() {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.setItem(AUTH_ALERT_STORAGE_KEY, UNAUTHORIZED_ALERT_MESSAGE);
}

export function clearAuthAlert() {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.removeItem(AUTH_ALERT_STORAGE_KEY);
}

export function consumeAuthAlert() {
  if (typeof sessionStorage === "undefined") {
    return "";
  }

  const authAlert = sessionStorage.getItem(AUTH_ALERT_STORAGE_KEY) || "";

  clearAuthAlert();

  return authAlert;
}