import { DEFAULT_AUTHENTICATED_PATH } from "./authAccess";

const MFA_RETURN_PATH_STORAGE_KEY = "idp.mfaReturnPath";
const MFA_SETUP_STORAGE_KEY = "idp.mfaSetup";
const MFA_VERIFIED_STORAGE_KEY = "idp.mfaVerified";
export const MFA_PATH = "/mfa";
export const MFA_AUTHENTICATOR_PATH = "/mfa/authenticator";
export const MFA_BACKUP_CODE_PATH = "/mfa/backup-code";
export const MFA_SETUP_PATH = "/mfa/setup";
export const MFA_SETUP_CONFIRM_PATH = "/mfa/setup/confirm";
const MFA_PATHS = new Set([
  MFA_PATH,
  MFA_AUTHENTICATOR_PATH,
  MFA_BACKUP_CODE_PATH,
  MFA_SETUP_PATH,
  MFA_SETUP_CONFIRM_PATH,
]);

function normalizeReturnPath(path = DEFAULT_AUTHENTICATED_PATH) {
  if (typeof path !== "string") {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  const normalizedPath = path.trim();

  if (
    !normalizedPath ||
    !normalizedPath.startsWith("/") ||
    normalizedPath.startsWith("//")
  ) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  const pathname = normalizedPath.split(/[?#]/)[0];

  if (MFA_PATHS.has(pathname)) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  return normalizedPath;
}

export function rememberMfaReturnPath(path = DEFAULT_AUTHENTICATED_PATH) {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.setItem(
    MFA_RETURN_PATH_STORAGE_KEY,
    normalizeReturnPath(path),
  );
}

export function consumeMfaReturnPath() {
  if (typeof sessionStorage === "undefined") {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  const returnPath = normalizeReturnPath(
    sessionStorage.getItem(MFA_RETURN_PATH_STORAGE_KEY) ??
      DEFAULT_AUTHENTICATED_PATH,
  );

  sessionStorage.removeItem(MFA_RETURN_PATH_STORAGE_KEY);

  return returnPath;
}

export function rememberMfaSetup(setup = {}) {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.setItem(
    MFA_SETUP_STORAGE_KEY,
    JSON.stringify({
      email: typeof setup.email === "string" ? setup.email : "",
      secret: typeof setup.secret === "string" ? setup.secret : "",
      otpAuthUri:
        typeof setup.otpAuthUri === "string" ? setup.otpAuthUri : "",
    }),
  );
}

export function getMfaSetup() {
  if (typeof sessionStorage === "undefined") {
    return { email: "", secret: "", otpAuthUri: "" };
  }

  try {
    const parsedSetup = JSON.parse(
      sessionStorage.getItem(MFA_SETUP_STORAGE_KEY) || "{}",
    );

    return {
      email: typeof parsedSetup.email === "string" ? parsedSetup.email : "",
      secret: typeof parsedSetup.secret === "string" ? parsedSetup.secret : "",
      otpAuthUri:
        typeof parsedSetup.otpAuthUri === "string"
          ? parsedSetup.otpAuthUri
          : "",
    };
  } catch (error) {
    console.error("Unable to read MFA setup:", error);
    return { email: "", secret: "", otpAuthUri: "" };
  }
}

export function clearMfaSetup() {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.removeItem(MFA_SETUP_STORAGE_KEY);
}

export function rememberMfaVerified() {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.setItem(MFA_VERIFIED_STORAGE_KEY, "true");
}

export function hasMfaVerified() {
  if (typeof sessionStorage === "undefined") {
    return false;
  }

  return sessionStorage.getItem(MFA_VERIFIED_STORAGE_KEY) === "true";
}

export function clearMfaVerified() {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.removeItem(MFA_VERIFIED_STORAGE_KEY);
}

export function isMfaPath(pathname = "") {
  return MFA_PATHS.has(pathname);
}