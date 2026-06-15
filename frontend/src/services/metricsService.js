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

  async downloadReport() {
    const response = await axiosInstance.get("/admin/report", {
      responseType: "blob",
    });

    return response.data;
  },
};
