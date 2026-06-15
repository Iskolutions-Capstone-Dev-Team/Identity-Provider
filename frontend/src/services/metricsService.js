import axiosInstance from "./axiosInstance";

export const metricsService = {
  async getDashboardMetrics() {
    const response = await axiosInstance.get("/admin/metrics");
    return response.data;
  },

  async downloadReport() {
    const response = await axiosInstance.get("/admin/report", {
      responseType: "blob",
    });

    return response.data;
  },
};
