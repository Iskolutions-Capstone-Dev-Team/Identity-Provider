import axiosInstance from "./axiosInstance";

const configuredBaseUrl = `${import.meta.env.VITE_API_BASE_URL ?? ""}`.toLowerCase();
const logsBasePath = configuredBaseUrl.concat("/admin/logs")


export const logService = {
  async getLogs({ page = 1, limit = 10, actor = "" } = {}) {
    const params = { page, limit };
    const normalizedActor = typeof actor === "string" ? actor.trim() : "";

    if (normalizedActor) {
      params.actor = normalizedActor;
    }

    const response = await axiosInstance.get(logsBasePath, { params });
    return response.data;
  },

  async getLogById(id) {
    const response = await axiosInstance.get(`${logsBasePath}/${id}`);
    return response.data;
  },
};
