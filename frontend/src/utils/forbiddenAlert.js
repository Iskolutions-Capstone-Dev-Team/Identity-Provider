export const IDP_FORBIDDEN_ALERT_EVENT = "idp:forbidden-alert";
export const DEFAULT_FORBIDDEN_ALERT_MESSAGE =
  "You are not authorized to access this system.";

const ALERT_COOLDOWN_MS = 3000;

let lastAlertMessage = "";
let lastAlertAt = 0;

function normalizeAlertMessage(message = "") {
  return typeof message === "string" ? message.trim() : "";
}

export function getForbiddenAlertMessage(message = "") {
  return normalizeAlertMessage(message) || DEFAULT_FORBIDDEN_ALERT_MESSAGE;
}

export function showForbiddenAlert(message = "") {
  if (typeof window === "undefined") {
    return;
  }

  const nextMessage = getForbiddenAlertMessage(message);
  const now = Date.now();

  if (
    nextMessage === lastAlertMessage &&
    now - lastAlertAt < ALERT_COOLDOWN_MS
  ) {
    return;
  }

  lastAlertMessage = nextMessage;
  lastAlertAt = now;

  window.dispatchEvent(
    new CustomEvent(IDP_FORBIDDEN_ALERT_EVENT, {
      detail: { message: nextMessage },
    }),
  );
}