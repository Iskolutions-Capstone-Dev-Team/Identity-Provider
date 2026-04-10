import axiosInstance from "./axiosInstance";

export const permissionService = {
  async getPermissions() {
    const response = await axiosInstance.get("/admin/permissions/all");
    return Array.isArray(response.data) ? response.data : [];
  },
};