import axiosInstance from "./axiosInstance";
import { buildAccountTypeOption, getAccountTypeBackendId, normalizeAccountType } from "../utils/accountTypes";
import { clearCachedRequests, getCachedRequest } from "../utils/requestCache";

const REGISTRATION_BASE_PATH = "/admin/registration";
const REGISTRATION_CACHE_PREFIX = "registration:";
const CREATE_ACCOUNT_TYPE_PLACEHOLDER_ID = 1;
const DEFAULT_ITEMS_PER_PAGE = 10;

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

function normalizePositiveInteger(value, fallbackValue) {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallbackValue;
}

function normalizeNonNegativeInteger(value, fallbackValue) {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isInteger(parsedValue) && parsedValue >= 0
    ? parsedValue
    : fallbackValue;
}

function getAccountTypeItems(payload = {}) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.account_types)) {
    return payload.account_types;
  }

  if (Array.isArray(payload?.accountTypes)) {
    return payload.accountTypes;
  }

  if (Array.isArray(payload?.data?.account_types)) {
    return payload.data.account_types;
  }

  if (Array.isArray(payload?.data?.accountTypes)) {
    return payload.data.accountTypes;
  }

  return [];
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

function buildRegistrationConfigPage(payload = {}, { limit, page, keyword }) {
  const accountTypes = getAccountTypeItems(payload);
  const normalizedKeyword = normalizeTextValue(keyword).toLowerCase();
  const normalizedPage = normalizePositiveInteger(page, 1);
  const normalizedLimit = normalizePositiveInteger(limit, DEFAULT_ITEMS_PER_PAGE);
  let configs = accountTypes
    .map((config) => normalizeAccountTypeConfig(config))
    .filter((config) => config.accountTypeValue);

  if (normalizedKeyword) {
    configs = configs.filter((config) =>
      [
        config.label,
        config.accountTypeValue,
        ...config.clients.map((client) => client.name),
      ].some((value) => value.toLowerCase().includes(normalizedKeyword)),
    );
  }

  const responseTotal =
    payload?.total_count ??
    payload?.totalCount ??
    payload?.total ??
    payload?.count ??
    payload?.data?.total_count ??
    payload?.data?.totalCount ??
    payload?.data?.total;
  const total = normalizeNonNegativeInteger(responseTotal, configs.length);
  const responseLastPage =
    payload?.last_page ??
    payload?.lastPage ??
    payload?.data?.last_page ??
    payload?.data?.lastPage;
  const lastPage = normalizePositiveInteger(
    responseLastPage,
    Math.max(1, Math.ceil(total / normalizedLimit)),
  );
  const shouldSliceLocally =
    responseTotal === undefined || responseTotal === null;
  const startIndex = (normalizedPage - 1) * normalizedLimit;
  const pageConfigs = shouldSliceLocally
    ? configs.slice(startIndex, startIndex + normalizedLimit)
    : configs;

  return {
    configs: pageConfigs,
    total,
    lastPage,
  };
}

export const registrationService = {
  async getRegistrationConfig(requestConfig = {}) {
    const pageData = await this.getRegistrationConfigPage({
      limit: 1000,
      requestConfig,
    });

    return pageData.configs;
  },

  async getRegistrationConfigPage({
    limit = DEFAULT_ITEMS_PER_PAGE,
    page = 1,
    keyword = "",
    requestConfig = {},
  } = {}) {
    const normalizedKeyword = normalizeTextValue(keyword);
    const normalizedPage = normalizePositiveInteger(page, 1);
    const normalizedLimit = normalizePositiveInteger(limit, DEFAULT_ITEMS_PER_PAGE);
    const cacheKey = [
      `${REGISTRATION_CACHE_PREFIX}config`,
      normalizedLimit,
      normalizedPage,
      normalizedKeyword,
    ].join(":");

    return getCachedRequest(cacheKey, async () => {
      const response = await axiosInstance.get(
        `${REGISTRATION_BASE_PATH}/config`,
        {
          ...requestConfig,
          params: {
            limit: normalizedLimit,
            page: normalizedPage,
            ...(normalizedKeyword ? { keyword: normalizedKeyword } : {}),
            ...(requestConfig.params ?? {}),
          },
        },
      );

      return buildRegistrationConfigPage(response.data ?? {}, {
        limit: normalizedLimit,
        page: normalizedPage,
        keyword: normalizedKeyword,
      });
    });
  },

  async getClientsByAccountTypeId(
    accountTypeId,
    fallbackAccountType = "",
    requestConfig = {},
  ) {
    return getCachedRequest(
      `${REGISTRATION_CACHE_PREFIX}config:${accountTypeId}`,
      async () => {
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

    clearCachedRequests(REGISTRATION_CACHE_PREFIX);
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

    clearCachedRequests(REGISTRATION_CACHE_PREFIX);
    return response.data;
  },

  async deleteAccountType(accountTypeId) {
    if (!Number.isInteger(accountTypeId) || accountTypeId <= 0) {
      throw new Error("Account type ID is required.");
    }

    const response = await axiosInstance.delete(
      `${REGISTRATION_BASE_PATH}/config/${accountTypeId}`,
    );

    clearCachedRequests(REGISTRATION_CACHE_PREFIX);
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