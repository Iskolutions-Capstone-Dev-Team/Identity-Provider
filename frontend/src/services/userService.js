import axiosInstance from "./axiosInstance";

export const userService = {
  async getUsers(page = 1) {
    const res = await axiosInstance.get(`/admin/users?page=${page}`);
    return res.data;
  },

  async createUser(data) {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("first_name", data.first_name);
    formData.append("middle_name", data.middle_name || "");
    formData.append("last_name", data.last_name);
    formData.append("user_name", data.user_name);
    formData.append("password", data.password);
    formData.append("status", data.status);
    data.roles.forEach(role => formData.append("roles", role));

    if (data.imageFile) {
      formData.append("image", data.imageFile);
    }

    const res = await axiosInstance.post("/admin/users", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    return res.data;
  },

  async deleteUser(id) {
    const res = await axiosInstance.delete(`/admin/users/${id}`);
    return res.data;
  },
};