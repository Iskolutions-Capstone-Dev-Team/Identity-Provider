import axiosInstance from "./axiosInstance";
import { clearCachedRequests, getCachedRequest } from "../utils/requestCache";

const ROLE_CACHE_PREFIX = "role:";

const normalizeTextValue = (value) =>
  typeof value === "string" ? value.trim() : "";

const toPositiveInt = (value) => {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizePermissionIds = (permissionIds = []) =>
  Array.from(
    new Set(
      (Array.isArray(permissionIds) ? permissionIds : [])
        .map((permissionId) => toPositiveInt(permissionId))
        .filter((permissionId) => permissionId !== null),
    ),
  );

const buildRolePayload = (data = {}) => ({
  role_name: normalizeTextValue(data.role_name),
  description: normalizeTextValue(data.description),
  permission_ids: normalizePermissionIds(data.permission_ids),
});

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
  async getRoles(page = 1, { keyword = "" } = {}) {
    const normalizedKeyword = normalizeTextValue(keyword);

    return getCachedRequest(
      `${ROLE_CACHE_PREFIX}list:${page}:${normalizedKeyword}`,
      async () => {
        const response = await axiosInstance.get("/admin/roles", {
          params: {
            page,
            ...(normalizedKeyword ? { keyword: normalizedKeyword } : {}),
          },
        });

        return response.data;
      },
    );
  },

  async getAllRolesPage(page = 1, { keyword = "" } = {}) {
    const normalizedKeyword = normalizeTextValue(keyword);

    return getCachedRequest(
      `${ROLE_CACHE_PREFIX}all:${page}:${normalizedKeyword}`,
      async () => {
        const response = await axiosInstance.get("/admin/roles/all", {
          params: {
            page,
            ...(normalizedKeyword ? { keyword: normalizedKeyword } : {}),
          },
        });

        return response.data;
      },
    );
  },

  async getAllRoles() {
    return getCachedRequest(`${ROLE_CACHE_PREFIX}summary`, async () => {
      const response = await axiosInstance.get("/admin/roles", {
        params: { page: 1, limit: 10 },
      });

      return response.data.roles;
    });
  },

  async getRoleById(id) {
    return getCachedRequest(`${ROLE_CACHE_PREFIX}detail:${id}`, async () => {
      const response = await axiosInstance.get(`/admin/roles/${id}`);
      return response.data;
    });
  },

  async getClientTags({ limit = 50, keyword = "" } = {}) {
    const uniqueTags = new Map();
    let currentPage = 1;
    let lastPage = 1;

    do {
      const response = await axiosInstance.get("/admin/clients/tags", {
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

  async createRole(data) {
    const response = await axiosInstance.post(
      "/admin/roles",
      buildRolePayload(data),
    );

    clearCachedRequests(ROLE_CACHE_PREFIX);
    return response.data;
  },

  async updateRole(id, data) {
    const response = await axiosInstance.put(
      `/admin/roles/${id}`,
      buildRolePayload(data),
    );

    clearCachedRequests(ROLE_CACHE_PREFIX);
    return response.data;
  },

  async deleteRole(id) {
    const response = await axiosInstance.delete(`/admin/roles/${id}`);
    clearCachedRequests(ROLE_CACHE_PREFIX);
    return response.data;
  },
};