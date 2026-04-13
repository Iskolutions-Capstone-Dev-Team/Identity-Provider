import { getAccessToken, hasRefreshToken } from "./authCookies";

export function hasStoredAccessToken() {
  return Boolean(getAccessToken());
}

export function hasStoredAuthTokens() {
  return hasStoredAccessToken() || hasRefreshToken();
}