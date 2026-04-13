import { clearAuthState, getAccessToken } from "./authCookies";

const TOKEN_EXPIRY_LEEWAY_SECONDS = 30;

function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");

    return JSON.parse(atob(normalizedPayload));
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token = getAccessToken()) {
  if (!token) {
    return true;
  }

  const payload = decodeJwtPayload(token);
  const expiration = payload?.exp;

  if (typeof expiration !== "number") {
    return true;
  }

  return expiration <= Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_LEEWAY_SECONDS;
}

export async function refreshAccessToken() {
  return null;
}

export async function ensureValidAccessToken() {
  const accessToken = getAccessToken();

  if (accessToken && !isAccessTokenExpired(accessToken)) {
    return accessToken;
  }

  clearAuthState();
  return null;
}
