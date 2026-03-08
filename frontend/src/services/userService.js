import axiosInstance from "./axiosInstance";

export const userService = {
  async getUsers(page = 1) {
    const res = await axiosInstance.get(`/admin/users?page=${page}`);
    return res.data;
  },

  async createUser(data) {
    const payload = {
      email: data.email,
      first_name: data.first_name,
      middle_name: data.middle_name || "",
      last_name: data.last_name,
      user_name: data.user_name,
      password: data.password,
      status: data.status,
      roles: data.roles || [],
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
