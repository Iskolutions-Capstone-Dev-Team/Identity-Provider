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
    const payload = {
      email: getRequiredTextValue(email, "Email address"),
    };

    const response = await axiosInstance.request({
      method: "GET",
      url: "/mfa/setup",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: JSON.stringify(payload),
    });

    return {
      secret: normalizeTextValue(response.data?.secret),
      otpAuthUri: normalizeTextValue(response.data?.otpauth_uri),
    };
  },

  async createAuthenticator({ email, secret, code, name } = {}) {
    const response = await axiosInstance.post("/mfa/authenticators", {
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
      "/mfa/verify",
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
};