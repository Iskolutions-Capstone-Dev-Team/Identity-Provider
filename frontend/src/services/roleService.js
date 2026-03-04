import axiosInstance from "./axiosInstance";

export const roleService = {
  // =========================
  // GET PAGINATED ROLES
  // =========================
  async getRoles(page = 1) {
    const response = await axiosInstance.get(`/admin/roles`, {
      params: { page },
    });

    return response.data;
  },

  // =========================
  // GET ALL ROLES FOR USERPOOL
  // =========================
  async getAllRoles() {
    const response = await axiosInstance.get(`/admin/roles`, {
      params: { page: 1, limit: 10 },
    });

    return response.data.roles;
  },

  // =========================
  // GET ROLE BY ID
  // =========================
  async getRoleById(id) {
    const response = await axiosInstance.get(`/admin/roles/${id}`);
    return response.data;
  },

  // =========================
  // CREATE ROLE
  // =========================
  async createRole(data) {
    const response = await axiosInstance.post(`/admin/roles`, {
      role_name: data.role_name,
      description: data.description,
    });

    return response.data;
  },

  // =========================
  // UPDATE ROLE
  // =========================
  async updateRole(id, data) {
    const response = await axiosInstance.put(`/admin/roles/${id}`, {
      role_name: data.role_name,
      description: data.description,
    });

    return response.data;
  },

  // =========================
  // DELETE ROLE
  // =========================
  async deleteRole(id) {
    const response = await axiosInstance.delete(`/admin/roles/${id}`);
    return response.data;
  },
};