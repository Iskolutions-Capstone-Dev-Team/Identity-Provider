import axiosInstance from "./axiosInstance";
import { buildAccountTypeOption, getAccountTypeBackendId, normalizeAccountType } from "../utils/accountTypes";

const REGISTRATION_BASE_PATH = "/admin/registration";
const CREATE_ACCOUNT_TYPE_PLACEHOLDER_ID = 1;

function normalizeTextValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBackendId(value) {
  return Number.isInteger(value) && value > 0 ? value : null;
}

function isMissingAccountTypeResponse(error) {
  const status = error?.response?.status;

  return status === 400 || status === 404;
}

function normalizeClient(client = {}) {
  return {
    id: normalizeTextValue(client?.id ?? client?.client_id ?? client?.clientId),
    name: normalizeTextValue(
      client?.name ?? client?.client_name ?? client?.clientName,
    ),
  };
}

function normalizeAccountTypeConfig(
  config = {},
  fallbackAccountType = "",
  fallbackBackendId = null,
) {
  const responseBackendId =
    normalizeBackendId(config?.id) ??
    normalizeBackendId(config?.account_type_id) ??
    normalizeBackendId(fallbackBackendId);
  const rawAccountType =
    normalizeTextValue(config?.account_type ?? config?.accountType) ||
    normalizeTextValue(fallbackAccountType);
  const accountTypeOption = buildAccountTypeOption(rawAccountType, {
    backendId: responseBackendId ?? getAccountTypeBackendId(rawAccountType),
  });

  return {
    accountType: accountTypeOption?.id || normalizeAccountType(rawAccountType),
    accountTypeValue:
      accountTypeOption?.value || normalizeAccountType(rawAccountType),
    label: accountTypeOption?.label || rawAccountType,
    backendId: responseBackendId ?? accountTypeOption?.backendId ?? null,
    clients: (Array.isArray(config?.clients) ? config.clients : [])
      .map(normalizeClient)
      .filter((client) => client.id && client.name),
  };
}

export const registrationService = {
  async getRegistrationConfig(requestConfig = {}) {
    const response = await axiosInstance.get(
      `${REGISTRATION_BASE_PATH}/config`,
      requestConfig,
    );
    const payload = response.data ?? {};
    const accountTypes = Array.isArray(payload?.account_types)
      ? payload.account_types
      : Array.isArray(payload?.accountTypes)
        ? payload.accountTypes
        : [];

    return accountTypes
      .map((config) => normalizeAccountTypeConfig(config))
      .filter((config) => config.accountTypeValue);
  },

  async getClientsByAccountTypeId(
    accountTypeId,
    fallbackAccountType = "",
    requestConfig = {},
  ) {
    const response = await axiosInstance.get(
      `${REGISTRATION_BASE_PATH}/config/${accountTypeId}`,
      requestConfig,
    );

    return normalizeAccountTypeConfig(
      response.data,
      fallbackAccountType,
      accountTypeId,
    );
  },

  async createAccountType({ name, clientIds = [] } = {}) {
    const normalizedName = normalizeTextValue(name);

    if (!normalizedName) {
      throw new Error("Account type name is required.");
    }

    const response = await axiosInstance.post(
      `${REGISTRATION_BASE_PATH}/config`,
      {
        id: CREATE_ACCOUNT_TYPE_PLACEHOLDER_ID,
        name: normalizedName,
        client_ids: (Array.isArray(clientIds) ? clientIds : []).filter(Boolean),
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    return response.data;
  },

  async updateAccountType({ accountTypeId, name, clientIds = [] } = {}) {
    if (!Number.isInteger(accountTypeId) || accountTypeId <= 0) {
      throw new Error("Account type ID is required.");
    }

    const normalizedName = normalizeTextValue(name);

    if (!normalizedName) {
      throw new Error("Account type name is required.");
    }

    const response = await axiosInstance.put(
      `${REGISTRATION_BASE_PATH}/config`,
      {
        id: accountTypeId,
        name: normalizedName,
        client_ids: (Array.isArray(clientIds) ? clientIds : []).filter(Boolean),
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    return response.data;
  },

  async deleteAccountType(accountTypeId) {
    if (!Number.isInteger(accountTypeId) || accountTypeId <= 0) {
      throw new Error("Account type ID is required.");
    }

    const response = await axiosInstance.delete(
      `${REGISTRATION_BASE_PATH}/config/${accountTypeId}`,
    );

    return response.data;
  },

  async resolveAccountTypeIdByName(accountTypeName) {
    const normalizedAccountTypeName = normalizeAccountType(accountTypeName);

    if (!normalizedAccountTypeName) {
      return null;
    }

    const cachedAccountTypeId = getAccountTypeBackendId(
      normalizedAccountTypeName,
    );

    if (cachedAccountTypeId) {
      return cachedAccountTypeId;
    }

    try {
      const registrationConfigs = await this.getRegistrationConfig({
        skipForbiddenAlert: true,
        skipForbiddenRedirect: true,
      });
      const matchedConfig = registrationConfigs.find(
        (config) =>
          normalizeAccountType(config?.accountTypeValue) ===
            normalizedAccountTypeName &&
          Number.isInteger(config?.backendId) &&
          config.backendId > 0,
      );

      return matchedConfig?.backendId ?? null;
    } catch (error) {
      if (isMissingAccountTypeResponse(error)) {
        return null;
      }

      console.error(
        `Unable to resolve account type ID for ${accountTypeName}:`,
        error,
      );
      return null;
    }
  },
};