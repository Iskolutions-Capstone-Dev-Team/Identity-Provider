import axiosInstance from "../services/axiosInstance";

const toPositiveInt = (value) => {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizeRoleIds = (roles = []) =>
  Array.from(
    new Set(
      (Array.isArray(roles) ? roles : [])
        .map((role) => toPositiveInt(role))
        .filter((roleId) => roleId !== null),
    ),
  );

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
  async getClients(limit = 10, offset = 0, keyword = "") {
    const normalizedKeyword =
      typeof keyword === "string" ? keyword.trim() : "";

    const response = await axiosInstance.get(`/admin/clients`, {
      params: {
        limit,
        offset,
        ...(normalizedKeyword ? { keyword: normalizedKeyword } : {}),
      },
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
    normalizeRoleIds(data.roles).forEach((roleId) =>
      formData.append("roles", String(roleId)),
    );

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
    normalizeRoleIds(data.roles).forEach((roleId) =>
      formData.append("roles", String(roleId)),
    );

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
    const response = await axiosInstance.patch(`/admin/clients/${id}/secret`);
    return normalizeRotateSecretPayload(response?.data, id);
  },
};
