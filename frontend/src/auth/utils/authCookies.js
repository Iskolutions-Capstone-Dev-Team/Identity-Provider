const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const TERMS_STORAGE_KEY = "termsAccepted";
const DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS = 3600;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function getCookieValue(name) {
  if (typeof document === "undefined") {
    return "";
  }

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

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

export function getRefreshToken() {
  return getCookieValue(REFRESH_TOKEN_COOKIE);
}

export function hasRefreshToken() {
  return Boolean(getRefreshToken());
}

export function storeTokenResponse(tokenResponse) {
  if (typeof document === "undefined" || !tokenResponse) {
    return;
  }

  const accessToken = tokenResponse.access_token;
  const refreshToken = tokenResponse.refresh_token;
  const expiresIn =
    Number(tokenResponse.expires_in) || DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS;

  if (accessToken) {
    document.cookie = buildCookie(
      ACCESS_TOKEN_COOKIE,
      accessToken,
      expiresIn,
    );
  }

  if (refreshToken) {
    document.cookie = buildCookie(
      REFRESH_TOKEN_COOKIE,
      refreshToken,
      REFRESH_TOKEN_MAX_AGE_SECONDS,
    );
  }
}

export function clearAuthState() {
  expireCookie(ACCESS_TOKEN_COOKIE);
  expireCookie(REFRESH_TOKEN_COOKIE);
  expireCookie("token");

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(TERMS_STORAGE_KEY);
  }
}
