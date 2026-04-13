import axios from "axios";

function normalizeTextValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getPasswordResetApiBaseUrl() {
  if (import.meta.env.DEV) {
    return "/api/v1";
  }

  return normalizeTextValue(import.meta.env.VITE_API_BASE_URL);
}

function getRequiredTextValue(value, label) {
  const normalizedValue = normalizeTextValue(value);

  if (!normalizedValue) {
    throw new Error(`${label} is required.`);
  }

  return normalizedValue;
}

function getJsonRequestConfig() {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
}

const passwordResetApi = axios.create({
  baseURL: getPasswordResetApiBaseUrl(),
  withCredentials: true,
});

export const passwordResetService = {
  async sendOtp({ email } = {}) {
    const response = await passwordResetApi.post(
      "/otp/send",
      {
        email: getRequiredTextValue(email, "Email address"),
      },
      getJsonRequestConfig(),
    );

    return response.data;
  },

  async verifyOtp({ email, otp } = {}) {
    const response = await passwordResetApi.post(
      "/otp/verify",
      {
        email: getRequiredTextValue(email, "Email address"),
        otp: getRequiredTextValue(otp, "OTP"),
      },
      getJsonRequestConfig(),
    );

    return response.data;
  },

  async updatePassword({ userId, newPassword } = {}) {
    const normalizedUserId = encodeURIComponent(
      getRequiredTextValue(userId, "User ID"),
    );

    const response = await passwordResetApi.patch(
      `/internal/user/${normalizedUserId}/password`,
      {
        new_password: getRequiredTextValue(newPassword, "New password"),
      },
      getJsonRequestConfig(),
    );

    return response.data;
  },
};