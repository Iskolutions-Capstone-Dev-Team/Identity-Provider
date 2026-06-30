import axiosInstance from "./axiosInstance";

let metricsRequestPromise = null;
let userMetricsPromise = null;
let roleMetricsPromise = null;
let clientMetricsPromise = null;
let permissionMetricsPromise = null;
let logMetricsPromise = null;
let registrationMetricsPromise = null;

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
    if (!userMetricsPromise) {
      userMetricsPromise = axiosInstance
        .get("/admin/users/metrics")
        .finally(() => {
          userMetricsPromise = null;
        });
    }
    const response = await userMetricsPromise;
    return response.data;
  },

  async getRoleMetrics() {
    if (!roleMetricsPromise) {
      roleMetricsPromise = axiosInstance
        .get("/admin/roles/metrics")
        .finally(() => {
          roleMetricsPromise = null;
        });
    }
    const response = await roleMetricsPromise;
    return response.data;
  },

  async getClientMetrics() {
    if (!clientMetricsPromise) {
      clientMetricsPromise = axiosInstance
        .get("/admin/clients/metrics")
        .finally(() => {
          clientMetricsPromise = null;
        });
    }
    const response = await clientMetricsPromise;
    return response.data;
  },

  async getPermissionMetrics() {
    if (!permissionMetricsPromise) {
      permissionMetricsPromise = axiosInstance
        .get("/admin/permissions/metrics")
        .finally(() => {
          permissionMetricsPromise = null;
        });
    }
    const response = await permissionMetricsPromise;
    return response.data;
  },

  async getLogMetrics() {
    if (!logMetricsPromise) {
      logMetricsPromise = axiosInstance
        .get("/admin/logs/metrics")
        .finally(() => {
          logMetricsPromise = null;
        });
    }
    const response = await logMetricsPromise;
    return response.data;
  },

  async getRegistrationMetrics() {
    if (!registrationMetricsPromise) {
      registrationMetricsPromise = axiosInstance
        .get("/admin/registration/metrics")
        .finally(() => {
          registrationMetricsPromise = null;
        });
    }
    const response = await registrationMetricsPromise;
    return response.data;
  },

  async downloadReport() {
    const response = await axiosInstance.get("/admin/report", {
      responseType: "blob",
    });

    return response.data;
  },
};
