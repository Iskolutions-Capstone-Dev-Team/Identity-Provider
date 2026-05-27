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
  async beginPasskeyRegistration(email) {
    const response = await axiosInstance.post(
      "/mfa/passkey/register/begin",
      { email: getRequiredTextValue(email, "Email address") },
    );
    return response.data;
  },

  /**
   * Passkey (WebAuthn) — Registration
   * Step 2: send the signed attestation back to complete enrolment.
   */
  async finishPasskeyRegistration(email, credential) {
    const response = await axiosInstance.post(
      `/mfa/passkey/register/finish?email=${encodeURIComponent(email)}`,
      credential,
    );
    return response.data;
  },

  /**
   * Passkey (WebAuthn) — Authentication
   * Step 1: fetch the assertion challenge from the server.
   */
  async beginPasskeyVerification(email) {
    const response = await axiosInstance.post(
      "/mfa/passkey/verify/begin",
      { email: getRequiredTextValue(email, "Email address") },
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
      `/mfa/passkey/verify/finish?email=${encodeURIComponent(email)}`,
      assertion,
      { skipUnauthorizedRedirect: true },
    );
    return response.data;
  },
};