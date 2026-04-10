import axiosInstance from "./axiosInstance";

const LOGS_BASE_PATH = "/admin/logs";
const SECURITY_LOGS_BASE_PATH = `${LOGS_BASE_PATH}/security`;

function buildLogParams({ page = 1, limit = 10, actor = "" } = {}) {
  const params = { page, limit };
  const normalizedActor = typeof actor === "string" ? actor.trim() : "";

  if (normalizedActor) {
    params.actor = normalizedActor;
  }

  return params;
}

export const logService = {
  async getLogs({ page = 1, limit = 10, actor = "" } = {}) {
    const response = await axiosInstance.get(LOGS_BASE_PATH, {
      params: buildLogParams({ page, limit, actor }),
    });
    return response.data;
  },

  async getLogById(id) {
    const response = await axiosInstance.get(`${LOGS_BASE_PATH}/${id}`);
    return response.data;
  },

  async getSecurityLogs({ page = 1, limit = 10, actor = "" } = {}) {
    const response = await axiosInstance.get(SECURITY_LOGS_BASE_PATH, {
      params: buildLogParams({ page, limit, actor }),
    });
    return response.data;
  },

  async getSecurityLogById(id) {
    const response = await axiosInstance.get(`${SECURITY_LOGS_BASE_PATH}/${id}`);
    return response.data;
  },
};