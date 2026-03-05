import axiosInstance from "../services/axiosInstance";

const normalizeRotateSecretPayload = (payload, fallbackClientId) => {
  const data = payload?.data ?? payload?.result ?? payload ?? {};

  return {
    client_id:
      data?.client_id ??
      data?.clientId ??
      payload?.client_id ??
      payload?.clientId ??
      fallbackClientId,
    client_secret:
      data?.client_secret ??
      data?.clientSecret ??
      data?.secret ??
      payload?.client_secret ??
      payload?.clientSecret ??
      payload?.secret ??
      "",
    message: data?.message ?? payload?.message ?? "",
  };
};

export const clientService = {
  async getClients(limit = 10, offset = 0) {
    const response = await axiosInstance.get(`/admin/clients`, {
      params: { limit, offset },
    });
    const payload = response.data;
    const items = Array.isArray(payload)
      ? payload
      : payload.data ?? payload.clients ?? payload.items ?? [];

    const total =
      payload?.total ??
      payload?.total_count ??
      payload?.count ??
      payload?.totalResults ??
      items.length;

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

    const response = await axiosInstance.post(`/admin/clients`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

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

    const response = await axiosInstance.put(`/admin/clients/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  async deleteClient(id) {
    const response = await axiosInstance.delete(`/admin/clients/${id}`);
    return response.data;
  },

  async rotateClientSecret(id) {
    const candidateEndpoints = [
      `/admin/clients/${id}/rotate-secret`,
      `/admin/clients/${id}/secret/rotate`,
      `/admin/clients/${id}/rotate-secret/`,
    ];

    let lastError = null;

    for (const endpoint of candidateEndpoints) {
      try {
        const response = await axiosInstance.post(endpoint);
        return normalizeRotateSecretPayload(response?.data, id);
      } catch (err) {
        const status = err?.response?.status;
        if (status && status !== 404 && status !== 405) {
          throw err;
        }
        lastError = err;
      }
    }

    throw lastError || new Error("Rotate secret endpoint not available.");
  },
};
