import axios from "axios";
import { normalizeAccountType } from "../../utils/accountTypes";

function normalizeTextValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getRegistrationApiBaseUrl() {
  if (import.meta.env.DEV) {
    return "/api/v1";
  }

  return normalizeTextValue(import.meta.env.VITE_API_BASE_URL);
}

const registrationFlowApi = axios.create({
  baseURL: getRegistrationApiBaseUrl(),
  withCredentials: true,
});

const UUID_PATTERN =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;

function getRequiredTextValue(value, label) {
  const normalizedValue = normalizeTextValue(value);

  if (!normalizedValue) {
    throw new Error(`${label} is required.`);
  }

  return normalizedValue;
}

function getJsonRequestConfig(extraHeaders = {}) {
  return {
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  };
}

function getRegistrationApiKey() {
  return normalizeTextValue(import.meta.env.VITE_BACKEND_API_KEY);
}

function getRegistrationRequestConfig() {
  const registrationApiKey = getRegistrationApiKey();

  if (!registrationApiKey) {
    throw new Error(
      "Registration API key is not available.",
    );
  }

  return getJsonRequestConfig({
    "X-API-Key": registrationApiKey,
  });
}

function extractCreatedUserId(payload = {}) {
  const explicitUserId =
    payload?.created_user_id ??
    payload?.createdUserId ??
    payload?.user_id ??
    payload?.userId ??
    payload?.id;

  if (typeof explicitUserId === "string" && explicitUserId.trim()) {
    return explicitUserId.trim();
  }

  const responseMessage = normalizeTextValue(payload?.message);
  const matchedUserId = responseMessage.match(UUID_PATTERN);

  return matchedUserId?.[0] ?? "";
}

export const registrationFlowService = {
  async registerAccount({
    firstName,
    lastName,
    middleName = "",
    suffix = "",
    email,
    accountType,
    password,
  } = {}) {
    const normalizedAccountType = normalizeAccountType(accountType);

    if (!normalizedAccountType) {
      throw new Error("Account type is required.");
    }

    const response = await registrationFlowApi.post(
      "/user",
      {
        first_name: getRequiredTextValue(firstName, "First name"),
        last_name: getRequiredTextValue(lastName, "Last name"),
        middle_name: normalizeTextValue(middleName),
        name_suffix: normalizeTextValue(suffix),
        email: getRequiredTextValue(email, "Email address"),
        password: getRequiredTextValue(password, "Password"),
        status: "active",
        account_type: normalizedAccountType,
      },
      getRegistrationRequestConfig(),
    );

    return {
      ...(response.data ?? {}),
      userId: extractCreatedUserId(response.data),
    };
  },

  async sendOtp({ email } = {}) {
    const response = await registrationFlowApi.post(
      "/otp/send",
      {
        email: getRequiredTextValue(email, "Email address"),
      },
      getJsonRequestConfig(),
    );

    return response.data;
  },

  async verifyOtp({ email, otp } = {}) {
    const response = await registrationFlowApi.post(
      "/otp/verify",
      {
        email: getRequiredTextValue(email, "Email address"),
        otp: getRequiredTextValue(otp, "OTP"),
      },
      getJsonRequestConfig(),
    );

    return response.data;
  },
};
