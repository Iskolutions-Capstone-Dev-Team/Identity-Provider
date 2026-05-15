import { clearAuthorizeReturnPath } from "./authorizeFlow";
import { clearMfaVerified } from "./mfaFlow";

const ACCESS_TOKEN_COOKIE = "access_token";
const LEGACY_REFRESH_TOKEN_COOKIE = "refresh_token";
const SESSION_COOKIE = "session_cookie";
const TERMS_STORAGE_KEY = "termsAccepted";
const DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS = 3600;

function getCookieRow(name) {
  if (typeof document === "undefined") {
    return "";
  }

  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`)) ?? ""
  );
}

function getCookieValue(name) {
  const cookie = getCookieRow(name);

  if (!cookie) {
    return "";
  }

  return decodeURIComponent(cookie.split("=")[1] ?? "");
}

function buildCookie(name, value, maxAgeSeconds) {
  const secureAttribute =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "Secure"
      : "";

  return [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAgeSeconds}`,
    "Path=/",
    "SameSite=Lax",
    secureAttribute,
  ].filter(Boolean).join("; ");
}

function expireCookie(name) {
  if (typeof document === "undefined") {
    return;
  }

  const secureAttribute =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${secureAttribute}`;
}

export function getAccessToken() {
  return getCookieValue(ACCESS_TOKEN_COOKIE);
}

export function clearLegacyRefreshTokenCookie() {
  if (!getCookieRow(LEGACY_REFRESH_TOKEN_COOKIE)) {
    return;
  }

  expireCookie(LEGACY_REFRESH_TOKEN_COOKIE);
}

export function storeTokenResponse(tokenResponse) {
  if (typeof document === "undefined" || !tokenResponse) {
    return;
  }

  const accessToken = tokenResponse.access_token;
  const expiresIn =
    Number(tokenResponse.expires_in) || DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS;

  if (accessToken) {
    document.cookie = buildCookie(
      ACCESS_TOKEN_COOKIE,
      accessToken,
      expiresIn,
    );
  }

  // Refresh tokens must stay server-managed, not in JS-readable storage.
  clearLegacyRefreshTokenCookie();
}

export function clearAuthState() {
  expireCookie(ACCESS_TOKEN_COOKIE);
  expireCookie(SESSION_COOKIE);
  clearLegacyRefreshTokenCookie();
  expireCookie("token");
  clearAuthorizeReturnPath();

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(TERMS_STORAGE_KEY);
  }

  clearMfaVerified();
}