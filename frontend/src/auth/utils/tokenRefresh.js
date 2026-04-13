import axios from "axios";
import { clearAuthState, getAccessToken, getRefreshToken, hasRefreshToken, storeTokenResponse } from "./authCookies";
import {
  isIdpProtectedPath,
  redirectToIdpErrorPage,
} from "./idpErrorPage";

const TOKEN_EXPIRY_LEEWAY_SECONDS = 30;
const REQUEST_TIMEOUT_MS = 10000;

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
});

let refreshPromise = null;

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
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post(
        "/auth/refresh",
        { refresh_token: refreshToken },
        { skipAuthRefresh: true },
      )
      .then((response) => {
        storeTokenResponse(response.data);
        return response.data.access_token ?? null;
      })
      .catch((error) => {
        clearAuthState();

        if (
          typeof window !== "undefined" &&
          isIdpProtectedPath(window.location.pathname)
        ) {
          redirectToIdpErrorPage(error);
        }

        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function ensureValidAccessToken() {
  const accessToken = getAccessToken();

  if (accessToken && !isAccessTokenExpired(accessToken)) {
    return accessToken;
  }

  if (!hasRefreshToken()) {
    clearAuthState();
    return null;
  }

  try {
    return await refreshAccessToken();
  } catch {
    return null;
  }
}