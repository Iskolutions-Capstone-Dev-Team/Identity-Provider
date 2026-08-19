import axiosInstance from "./axiosInstance";
import { buildSafePaginationParams } from "../utils/safeQueryParams";

const LOGS_BASE_PATH = "/admin/logs";
const SECURITY_LOGS_BASE_PATH = `${LOGS_BASE_PATH}/security`;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function buildLogParams({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, sortBy = "created_at", order = "desc", actor = "" } = {}) {
  const params = buildSafePaginationParams(
    { page, limit },
    {
      defaultPage: DEFAULT_PAGE,
      defaultLimit: DEFAULT_LIMIT,
      maxLimit: MAX_LIMIT,
    },
  );
  const normalizedActor = typeof actor === "string" ? actor.trim() : "";

  params.sort_by = sortBy;
  params.order = order;

  if (normalizedActor) {
    params.actor = normalizedActor;
  }

  return params;
}

export const logService = {
  async getLogs({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, sortBy = "created_at", order = "desc", actor = "", signal } = {}) {
    const response = await axiosInstance.get(LOGS_BASE_PATH, {
      params: buildLogParams({ page, limit, sortBy, order, actor }),
      signal,
    });
    return response.data;
  },

  async getLogById(id) {
    const response = await axiosInstance.get(`${LOGS_BASE_PATH}/${id}`);
    return response.data;
  },

  async getSecurityLogs({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, sortBy = "created_at", order = "desc", actor = "", signal } = {}) {
    const response = await axiosInstance.get(SECURITY_LOGS_BASE_PATH, {
      params: buildLogParams({ page, limit, sortBy, order, actor }),
      signal,
    });
    return response.data;
  },

  async getSecurityLogById(id) {
    const response = await axiosInstance.get(`${SECURITY_LOGS_BASE_PATH}/${id}`);
    return response.data;
  },
};