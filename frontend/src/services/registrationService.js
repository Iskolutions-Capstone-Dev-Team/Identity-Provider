import axiosInstance from "./axiosInstance";
import { normalizeAccountType } from "../utils/accountTypes";

const REGISTRATION_BASE_PATH = "/admin/registration";

function normalizeTextValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeClient(client = {}) {
  return {
    id: normalizeTextValue(client?.id ?? client?.client_id ?? client?.clientId),
    name: normalizeTextValue(
      client?.name ?? client?.client_name ?? client?.clientName,
    ),
  };
}

function normalizeAccountTypeConfig(config = {}, fallbackAccountType = "") {
  return {
    accountType: normalizeAccountType(
      config?.account_type ?? config?.accountType,
    ) || normalizeAccountType(fallbackAccountType),
    clients: (Array.isArray(config?.clients) ? config.clients : [])
      .map(normalizeClient)
      .filter((client) => client.id && client.name),
  };
}

export const registrationService = {
  async getRegistrationConfig() {
    const response = await axiosInstance.get(`${REGISTRATION_BASE_PATH}/config`);
    const payload = response.data ?? {};
    const accountTypes = Array.isArray(payload?.account_types)
      ? payload.account_types
      : Array.isArray(payload?.accountTypes)
        ? payload.accountTypes
        : [];

    return accountTypes
      .map(normalizeAccountTypeConfig)
      .filter((config) => config.accountType);
  },

  async getClientsByAccountTypeId(accountTypeId, fallbackAccountType = "") {
    const response = await axiosInstance.get(
      `${REGISTRATION_BASE_PATH}/config/${accountTypeId}`,
    );

    return normalizeAccountTypeConfig(
      response.data,
      fallbackAccountType,
    );
  },

  async updatePreapprovedClients({ accountTypeId, clientIds = [] } = {}) {
    const response = await axiosInstance.put(
      `${REGISTRATION_BASE_PATH}/preapproved`,
      {
        account_type_id: accountTypeId,
        client_ids: (Array.isArray(clientIds) ? clientIds : []).filter(Boolean),
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    return response.data;
  },
};