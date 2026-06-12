import axiosInstance from "./axiosInstance";

function normalizeTextValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getRequiredTextValue(value, label) {
  const normalizedValue = normalizeTextValue(value);

  if (!normalizedValue) {
    throw new Error(`${label} is required.`);
  }

  return normalizedValue;
}

function getExistsValue(data, responseKey) {
  if (typeof data === "boolean") {
    return data;
  }

  return data?.exists === true || data?.[responseKey] === true;
}

export const mfaService = {
  async getSetup(email) {
    const response = await axiosInstance.request({
      method: "GET",
      url: "/mfa/totp/setup",
      params: {
        email: getRequiredTextValue(email, "Email address"),
      },
    });

    return {
      secret: normalizeTextValue(response.data?.secret),
      otpAuthUri: normalizeTextValue(response.data?.otpauth_uri),
    };
  },

  async createAuthenticator({ email, secret, code, name } = {}) {
    const response = await axiosInstance.post("/mfa/totp/authenticators", {
      email: getRequiredTextValue(email, "Email address"),
      secret: getRequiredTextValue(secret, "Secret"),
      code: getRequiredTextValue(code, "Verification code"),
      name: getRequiredTextValue(name, "Authenticator name"),
    });

    return {
      otpAuthUri: normalizeTextValue(response.data?.otpauth_uri),
      backupCodes: Array.isArray(response.data?.backup_codes)
        ? response.data.backup_codes
        : [],
    };
  },

  async verifyCode({ email, code } = {}) {
    const response = await axiosInstance.post(
      "/mfa/totp/verify",
      {
        email: getRequiredTextValue(email, "Email address"),
        code: getRequiredTextValue(code, "Verification code"),
      },
      {
        skipUnauthorizedRedirect: true,
        skipAuthHeader: true,
      },
    );

    return response.data;
  },

  async getAuthenticators(email) {
    const response = await axiosInstance.get(
      "/mfa/authenticators/list",
      {
        params: {
          email: getRequiredTextValue(email, "Email address"),
        },
      },
    );

    return Array.isArray(response.data) ? response.data : [];
  },

  async hasTotpAuthenticator(email) {
    const response = await axiosInstance.get("/mfa/totp/exists", {
      params: {
        email: getRequiredTextValue(email, "Email address"),
      },
      skipAuthHeader: true,
    });

    return getExistsValue(response.data, "has_totp");
  },

  async hasPasskey(email) {
    const response = await axiosInstance.get("/mfa/passkey/exists", {
      params: {
        email: getRequiredTextValue(email, "Email address"),
      },
      skipAuthHeader: true,
    });

    return getExistsValue(response.data, "has_passkey");
  },

  async deleteAuthenticator({ email, id } = {}) {
    const response = await axiosInstance.delete("/mfa/authenticators", {
      data: {
        email: getRequiredTextValue(email, "Email address"),
        id: getRequiredTextValue(id, "Authenticator ID"),
      },
    });

    return response.data;
  },

  /**
   * Passkey (WebAuthn) — Registration
   * Step 1: fetch the challenge from the server.
   */
  async beginPasskeyRegistration(email, platformAvailable) {
    const response = await axiosInstance.post(
      "/mfa/passkey/register/begin",
      {
        email: getRequiredTextValue(email, "Email address"),
        platform_available: platformAvailable,
      },
      {
        skipUnauthorizedRedirect: true,
      },
    );
    return response.data;
  },

  /**
   * Passkey (WebAuthn) — Registration
   * Step 2: send the signed attestation back to complete enrolment.
   */
  async finishPasskeyRegistration(email, credential) {
    const response = await axiosInstance.post(
      "/mfa/passkey/register/finish",
      credential,
      {
        params: {
          email: getRequiredTextValue(email, "Email address"),
        },
        skipUnauthorizedRedirect: true,
      },
    );
    return response.data;
  },

  /**
   * Passkey (WebAuthn) — Authentication
   * Step 1: fetch the assertion challenge from the server.
   */
  async beginPasskeyVerification(email, platformAvailable) {
    const response = await axiosInstance.post(
      "/mfa/passkey/verify/begin",
      {
        email: getRequiredTextValue(email, "Email address"),
        platform_available: platformAvailable,
      },
      {
        skipAuthHeader: true,
      },
    );
    return response.data;
  },

  /**
   * Passkey (WebAuthn) — Authentication
   * Step 2: send the signed assertion to complete verification.
   * Returns 200 on success; call finishMfa() afterwards.
   */
  async finishPasskeyVerification(email, assertion) {
    const response = await axiosInstance.post(
      "/mfa/passkey/verify/finish",
      assertion,
      {
        params: {
          email: getRequiredTextValue(email, "Email address"),
        },
        skipAuthHeader: true,
        skipUnauthorizedRedirect: true,
      },
    );
    return response.data;
  },
};
