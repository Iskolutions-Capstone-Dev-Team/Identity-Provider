import axiosInstance from "./axiosInstance";

export const permissionService = {
  async getPermissions() {
    const response = await axiosInstance.get("/admin/permissions/all", {
      skipForbiddenAlert: true,
    });
    return Array.isArray(response.data) ? response.data : [];
  },

  async getCurrentUserPermissions() {
    const response = await axiosInstance.get("/admin/permissions", {
      skipForbiddenAlert: true,
    });
    return Array.isArray(response.data?.permissions)
      ? response.data.permissions
      : [];
  },
};