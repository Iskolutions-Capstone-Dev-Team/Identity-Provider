import axiosInstance from "./axiosInstance";
import { getCachedRequest } from "../utils/requestCache";

const PERMISSION_CACHE_PREFIX = "permission:";

export const permissionService = {
  async getPermissions() {
    return getCachedRequest(`${PERMISSION_CACHE_PREFIX}all`, async () => {
      const response = await axiosInstance.get("/admin/permissions/all", {
        skipForbiddenAlert: true,
      });

      return Array.isArray(response.data) ? response.data : [];
    });
  },

  async getCurrentUserPermissions() {
    return getCachedRequest(`${PERMISSION_CACHE_PREFIX}current`, async () => {
      const response = await axiosInstance.get("/admin/permissions", {
        skipForbiddenAlert: true,
      });

      return Array.isArray(response.data?.permissions)
        ? response.data.permissions
        : [];
    });
  },
};