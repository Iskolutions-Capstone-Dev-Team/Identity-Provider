import axiosInstance from "../services/axiosInstance";

export const clientService = {
  async getClients(limit = 10, offset = 0) {
    const response = await axiosInstance.get(`/admin/clients`, {
      params: { limit, offset },
    });
    return response.data;
  },

  async getClientById(id) {
    const response = await axiosInstance.get(`/admin/clients/${id}`);
    return response.data;
  },

  async createClient(data) {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("abbreviation", data.abbreviation);
    formData.append("description", data.description || "");
    formData.append("base_url", data.base_url);
    formData.append("redirect_uri", data.redirect_uri);
    formData.append("logout_uri", data.logout_uri);

    data.grants.forEach((g) => formData.append("grants", g));
    data.roles.forEach((r) => formData.append("roles", r));

    if (data.imageFile) {
      formData.append("image", data.imageFile);
    }

    const response = await axiosInstance.post(
      `/admin/clients`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data;
  },

  async updateClient(id, data) {
    const response = await axiosInstance.put(
      `/admin/clients/${id}`,
      {
        name: data.name,
        description: data.description,
        base_url: data.base_url,
        redirect_uri: data.redirect_uri,
        logout_uri: data.logout_uri,
        image_location: data.image_location,
      }
    );

    return response.data;
  },

  async deleteClient(id) {
    const response = await axiosInstance.delete(
      `/admin/clients/${id}`
    );
    return response.data;
  },
};