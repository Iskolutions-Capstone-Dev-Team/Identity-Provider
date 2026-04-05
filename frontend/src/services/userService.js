import axiosInstance from "./axiosInstance";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 100;

const normalizeTextValue = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeRoleId = (value) => {
  if (value === null) {
    return null;
  }

  const normalizedValue = Number.parseInt(value, 10);
  return Number.isInteger(normalizedValue) && normalizedValue > 0
    ? normalizedValue
    : undefined;
};

export const userService = {
  async getMe() {
    const res = await axiosInstance.get("/me");
    return res.data;
  },

  async getUsers({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = {}) {
    const res = await axiosInstance.get("/admin/users", {
      params: { page, limit },
    });
    return res.data;
  },

  async getAdminUsers({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = {}) {
    const res = await axiosInstance.get("/admin/users/admin", {
      params: { page, limit },
    });
    return res.data;
  },

  async getUser(id) {
    const res = await axiosInstance.get(`/admin/users/${id}`);
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
      role_id: normalizeRoleId(data.role_id) ?? null,
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

  async updateUserRole(id, roleId = null) {
    const normalizedRoleId = normalizeRoleId(roleId);
    const payload = {
      role_id: normalizedRoleId ?? null,
    };

    const res = await axiosInstance.patch(`/admin/users/${id}/role`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  },

  async deleteUser(id) {
    const res = await axiosInstance.delete(`/admin/users/${id}`);
    return res.data;
  },
};