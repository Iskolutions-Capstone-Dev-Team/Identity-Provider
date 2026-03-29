import axiosInstance from "../services/axiosInstance";

const normalizeStringValue = (value) =>
  typeof value === "string" ? value : "";

const normalizeStringList = (values = []) =>
  (Array.isArray(values) ? values : []).filter(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

const getClientItems = (payload = {}) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.clients)) {
    return payload.clients;
  }

  if (Array.isArray(payload.data?.clients)) {
    return payload.data.clients;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

const buildClientFormData = (data = {}) => {
  const formData = new FormData();

  formData.append("name", normalizeStringValue(data.name));
  formData.append("description", normalizeStringValue(data.description));
  formData.append("base_url", normalizeStringValue(data.base_url));
  formData.append("redirect_uri", normalizeStringValue(data.redirect_uri));
  formData.append("logout_uri", normalizeStringValue(data.logout_uri));

  normalizeStringList(data.grants).forEach((grant) => {
    formData.append("grants", grant);
  });

  if (data.imageFile) {
    formData.append("image", data.imageFile);
  }

  return formData;
};

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
  async getClients({ limit = 10, page = 1, keyword = "" } = {}) {
    const normalizedKeyword =
      typeof keyword === "string" ? keyword.trim() : "";
    const normalizedPage =
      Number.isInteger(page) && page > 0 ? page : 1;

    const response = await axiosInstance.get("/admin/clients", {
      params: {
        limit,
        page: normalizedPage,
        ...(normalizedKeyword ? { keyword: normalizedKeyword } : {}),
      },
    });

    const payload = response.data ?? {};
    const items = getClientItems(payload);
    const total =
      payload.total_count ??
      payload.total ??
      payload.count ??
      payload.totalResults ??
      items.length;
    const lastPage =
      payload.last_page ??
      payload.lastPage ??
      Math.max(1, Math.ceil(total / limit));

    return {
      items,
      total: Number.isInteger(total) ? total : items.length,
      lastPage: Number.isInteger(lastPage) && lastPage > 0 ? lastPage : 1,
    };
  },

  async getClientById(id) {
    const response = await axiosInstance.get(`/admin/clients/${id}`);
    return response.data;
  },

  async createClient(data) {
    const formData = buildClientFormData(data);
    const response = await axiosInstance.post("/admin/clients", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  async updateClient(id, data) {
    const formData = buildClientFormData(data);
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