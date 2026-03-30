import axiosInstance from "./axiosInstance";

const normalizeTextValue = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeRoleNames = (roles = []) =>
  Array.from(
    new Set(
      (Array.isArray(roles) ? roles : [])
        .map((role) => normalizeTextValue(role))
        .filter(Boolean),
    ),
  );

export const userService = {
  async getMe() {
    const res = await axiosInstance.get("/me");
    return res.data;
  },

  async getUsers(page = 1) {
    const res = await axiosInstance.get("/admin/users", {
      params: { page },
    });
    return res.data;
  },

  async createUser(data) {
    const payload = {
      email: normalizeTextValue(data.email),
      first_name: normalizeTextValue(data.first_name),
      middle_name: normalizeTextValue(data.middle_name),
      last_name: normalizeTextValue(data.last_name),
      name_suffix: normalizeTextValue(data.name_suffix),
      password: normalizeTextValue(data.password),
      status: normalizeTextValue(data.status).toLowerCase(),
      roles: normalizeRoleNames(data.roles),
    };

    const res = await axiosInstance.post("/admin/users", payload, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  },

  async updateUserStatus(id, status) {
    const normalizedStatus =
      typeof status === "string" ? status.trim().toLowerCase() : "";

    if (!normalizedStatus) {
      throw new Error("Status is required.");
    }

    const payload = {
      new_status: normalizedStatus,
    };

    const res = await axiosInstance.patch(`/admin/users/${id}/status`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  },

  async updateUserRoles(id, roleIds = []) {
    const payload = {
      role_ids: roleIds,
    };

    const res = await axiosInstance.patch(`/admin/users/${id}/roles`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  },

  async deleteUser(id) {
    const res = await axiosInstance.delete(`/admin/users/${id}`);
    return res.data;
  },
};