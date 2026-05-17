import { getAccessToken, getPendingMfaAccessToken } from "./authCookies";

export function hasStoredAccessToken() {
  return Boolean(getAccessToken());
}

export function hasStoredAuthTokens() {
  return hasStoredAccessToken() || Boolean(getPendingMfaAccessToken());
}