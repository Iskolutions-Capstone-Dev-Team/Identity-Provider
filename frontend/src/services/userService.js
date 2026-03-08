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

  async deleteUser(id) {
    const res = await axiosInstance.delete(`/admin/users/${id}`);
    return res.data;
  },
};
