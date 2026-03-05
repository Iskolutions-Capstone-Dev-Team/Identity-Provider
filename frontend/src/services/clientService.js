import axiosInstance from "../services/axiosInstance";

export const clientService = {
  async getClients(limit = 10, offset = 0) {
    const response = await axiosInstance.get(`/admin/clients`, {
      params: { limit, offset },
    });
    const payload = response.data;
    const items = Array.isArray(payload)
      ? payload
      : (payload.data ?? payload.clients ?? payload.items ?? []);

    const total = payload?.total ?? payload?.count ?? items.length;

    return { items, total };
  },

  async getClientById(id) {
    const response = await axiosInstance.get(`/admin/clients/${id}`);
    return response.data;
  },

  async createClient(data) {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("tag", data.tag);
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
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("base_url", data.base_url);
    formData.append("redirect_uri", data.redirect_uri);
    formData.append("logout_uri", data.logout_uri);

    (data.grants || []).forEach((g) => formData.append("grants", g));
    (data.roles || []).forEach((r) => formData.append("roles", r));

    if (data.imageFile) {
      formData.append("image", data.imageFile);
    } else if (data.image_location !== undefined) {
      formData.append("image_location", data.image_location);
    }

    const response = await axiosInstance.put(
      `/admin/clients/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
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