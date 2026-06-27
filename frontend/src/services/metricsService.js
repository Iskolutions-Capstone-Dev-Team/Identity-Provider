import axiosInstance from "./axiosInstance";

let metricsRequestPromise = null;

export const metricsService = {
  async getDashboardMetrics() {
    if (!metricsRequestPromise) {
      metricsRequestPromise = axiosInstance
        .get("/admin/metrics")
        .finally(() => {
          metricsRequestPromise = null;
        });
    }
    const response = await metricsRequestPromise;
    return response.data;
  },

  async getUserMetrics() {
    const response = await axiosInstance.get("/admin/users/metrics");
    return response.data;
  },

  async getRoleMetrics() {
    const response = await axiosInstance.get("/admin/roles/metrics");
    return response.data;
  },

  async getClientMetrics() {
    const response = await axiosInstance.get("/admin/clients/metrics");
    return response.data;
  },

  async getPermissionMetrics() {
    const response = await axiosInstance.get("/admin/permissions/metrics");
    return response.data;
  },

  async getLogMetrics() {
    const response = await axiosInstance.get("/admin/logs/metrics");
    return response.data;
  },

  async getRegistrationMetrics() {
    const response = await axiosInstance.get("/admin/registration/metrics");
    return response.data;
  },

  async downloadReport() {
    const response = await axiosInstance.get("/admin/report", {
      responseType: "blob",
    });

    return response.data;
  },
};
