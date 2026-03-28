import axiosInstance from "./axiosInstance";

const normalizeClientTagOption = (client = {}) => {
  const rawTag = typeof client.tag === "string" ? client.tag.trim() : "";
  if (!rawTag) return null;

  const image =
    client.image_location ??
    client.imageLocation ??
    client.image ??
    "";

  return {
    id: rawTag,
    tag: rawTag,
    image: typeof image === "string" ? image : "",
  };
};

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

  async getAllRolesPage(page = 1) {
    const response = await axiosInstance.get(`/admin/roles/all`, {
      params: { page },
    });

    return response.data;
  },

  async searchRoles(keyword = "") {
    const normalizedKeyword =
      typeof keyword === "string" ? keyword.trim() : "";

    if (!normalizedKeyword) {
      return {
        roles: [],
        current_page: 1,
        last_page: 1,
        total_count: 0,
      };
    }

    try {
      const response = await axiosInstance.get(`/admin/roles`, {
        params: { keyword: normalizedKeyword },
      });
      const roles = Array.isArray(response.data?.roles) ? response.data.roles : [];

      return {
        ...response.data,
        roles,
        current_page: 1,
        last_page: 1,
        total_count: roles.length,
      };
    } catch (error) {
      if (error?.response?.status === 404) {
        return {
          roles: [],
          current_page: 1,
          last_page: 1,
          total_count: 0,
        };
      }

      throw error;
    }
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
  // GET CLIENT TAGS + LOGOS
  // =========================
  async getClientTags({ limit = 50, keyword = "" } = {}) {
    const uniqueTags = new Map();
    let currentPage = 1;
    let lastPage = 1;

    do {
      const response = await axiosInstance.get(`/admin/clients/tags`, {
        params: {
          limit,
          page: currentPage,
          ...(typeof keyword === "string" && keyword.trim()
            ? { keyword: keyword.trim() }
            : {}),
        },
      });

      const payload = response.data ?? {};
      const clients = Array.isArray(payload.clients)
        ? payload.clients
        : Array.isArray(payload.data?.clients)
          ? payload.data.clients
          : [];

      clients.forEach((client) => {
        const normalizedTag = normalizeClientTagOption(client);
        if (normalizedTag && !uniqueTags.has(normalizedTag.id)) {
          uniqueTags.set(normalizedTag.id, normalizedTag);
        }
      });

      const parsedLastPage = Number.parseInt(
        payload.last_page ?? payload.lastPage ?? currentPage,
        10,
      );
      lastPage =
        Number.isInteger(parsedLastPage) && parsedLastPage > 0
          ? parsedLastPage
          : currentPage;

      currentPage += 1;
    } while (currentPage <= lastPage);

    return Array.from(uniqueTags.values()).sort((a, b) =>
      a.tag.localeCompare(b.tag),
    );
  },

  // =========================
  // CREATE ROLE
  // =========================
  async createRole(data) {
    const response = await axiosInstance.post(`/admin/roles`, {
      role_name: data.role_name,
      description: data.description,
      permission_ids: data.permission_ids || [],
      permissions: data.permissions || [],
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
      permission_ids: data.permission_ids || [],
      permissions: data.permissions || [],
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