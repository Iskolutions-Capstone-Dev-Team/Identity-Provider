import axiosInstance from "./axiosInstance";

export const getSystemHealth = async () => {
  // Using /health directly as configured in the router, or /api/v1/health.
  // We'll use /api/v1/health as it is registered there as well.
  const response = await axiosInstance.get("/health");
  return response.data;
};
