import axiosInstance from "./axiosInstance";

const LOGS_BASE_PATH = "/admin/logs";


export const logService = {
  async getLogs({ page = 1, limit = 10, actor = "" } = {}) {
    const params = { page, limit };
    const normalizedActor = typeof actor === "string" ? actor.trim() : "";

    if (normalizedActor) {
      params.actor = normalizedActor;
    }

    const response = await axiosInstance.get(LOGS_BASE_PATH, { params });
    return response.data;
  },

  async getLogById(id) {
    const response = await axiosInstance.get(`${LOGS_BASE_PATH}/${id}`);
    return response.data;
  },
};
