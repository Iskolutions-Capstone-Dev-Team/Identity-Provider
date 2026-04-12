import { normalizeAccountType } from "../utils/accountTypes";
import axiosInstance from "./axiosInstance";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 100;
const UUID_PATTERN =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;

const normalizeTextValue = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeStringList = (values = []) =>
  (Array.isArray(values) ? values : [])
    .map((value) => normalizeTextValue(value))
    .filter(Boolean);

const normalizeRoleId = (value) => {
  if (value === null) {
    return null;
  }

  const normalizedValue = Number.parseInt(value, 10);
  return Number.isInteger(normalizedValue) && normalizedValue > 0
    ? normalizedValue
    : undefined;
};

const extractCreatedUserId = (payload = {}) => {
  const explicitUserId =
    payload?.created_user_id ??
    payload?.createdUserId ??
    payload?.user_id ??
    payload?.userId ??
    payload?.id;

  if (typeof explicitUserId === "string" && explicitUserId.trim()) {
    return explicitUserId.trim();
  }

  const responseMessage = normalizeTextValue(payload?.message);
  const matchedUserId = responseMessage.match(UUID_PATTERN);

  return matchedUserId?.[0] ?? "";
};

export const userService = {
  async getMe() {
    const res = await axiosInstance.get("/me");
    return res.data;
  },

  async getUsers({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = {}) {
    const res = await axiosInstance.get("/admin/users", {
      params: { page, limit },
    });
    return res.data;
  },

  async getAdminUsers({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = {}) {
    const res = await axiosInstance.get("/admin/users/admins", {
      params: { page, limit },
    });
    return res.data;
  },

  async getUser(id) {
    const res = await axiosInstance.get(`/admin/users/${id}`);
    return res.data;
  },

  async updateUserName(id, data = {}) {
    const userId = normalizeTextValue(id);

    if (!userId) {
      throw new Error("User ID is required.");
    }

    const payload = {
      first_name: normalizeTextValue(data.firstName ?? data.first_name),
      middle_name: normalizeTextValue(data.middleName ?? data.middle_name),
      last_name: normalizeTextValue(data.lastName ?? data.last_name),
      name_suffix: normalizeTextValue(
        data.suffix ?? data.nameSuffix ?? data.name_suffix,
      ),
    };

    if (!payload.first_name) {
      throw new Error("First name is required.");
    }

    if (!payload.last_name) {
      throw new Error("Last name is required.");
    }

    const res = await axiosInstance.patch(
      `/internal/user/${userId}/name`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return res.data;
  },

  async getManagedUserAccessClients() {
    const res = await axiosInstance.get("/admin/users/access");
    return Array.isArray(res.data) ? res.data : [];
  },

  async createUser(data) {
    const payload = {
      email: normalizeTextValue(data.email),
      first_name: normalizeTextValue(data.first_name),
      middle_name: normalizeTextValue(data.middle_name),
      last_name: normalizeTextValue(data.last_name),
      name_suffix: normalizeTextValue(data.name_suffix),
      password: normalizeTextValue(data.password),
      status: normalizeTextValue(data.status).toLowerCase(),
      role_id: normalizeRoleId(data.role_id) ?? null,
      account_type: normalizeAccountType(data.account_type),
      allowed_appclients: normalizeStringList(data.allowed_appclients),
    };

    const res = await axiosInstance.post("/admin/users", payload, {
      headers: { "Content-Type": "application/json" },
    });

    return {
      ...(res.data ?? {}),
      createdUserId: extractCreatedUserId(res.data),
    };
  },

  async updateUserStatus(id, status) {
    const normalizedStatus =
      typeof status === "string" ? status.trim().toLowerCase() : "";

    if (!normalizedStatus) {
      throw new Error("Status is required.");
    }

    const payload = {
      new_status: normalizedStatus,
    };

    const res = await axiosInstance.patch(`/admin/users/${id}/status`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  },

  async updateUserRole(id, roleId = null) {
    const normalizedRoleId = normalizeRoleId(roleId);
    const payload = {
      role_id: normalizedRoleId ?? null,
    };

    const res = await axiosInstance.patch(`/admin/users/${id}/role`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  },

  async updateUserAccess(id, clientIds = []) {
    const payload = {
      client_ids: normalizeStringList(clientIds),
    };

    const res = await axiosInstance.put(`/admin/users/${id}/access`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  },

  async deleteUser(id) {
    const res = await axiosInstance.delete(`/admin/users/${id}`);
    return res.data;
  },
};