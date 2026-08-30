import axiosInstance from "./axiosInstance";

function normalizeTextValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getRequiredTextValue(value, label) {
  const normalizedValue = normalizeTextValue(value);

  if (!normalizedValue) {
    throw new Error(`${label} is required.`);
  }

  return normalizedValue;
}

function normalizeDevice(device = {}) {
  return {
    id: normalizeTextValue(device.id),
    name: normalizeTextValue(device.name),
    browser: normalizeTextValue(device.browser),
    os: normalizeTextValue(device.os),
    ipAddress: normalizeTextValue(device.ip_address ?? device.ipAddress),
    lastUsedAt: normalizeTextValue(device.last_used_at ?? device.lastUsedAt),
    createdAt: normalizeTextValue(device.created_at ?? device.createdAt),
    expiresAt: normalizeTextValue(device.expires_at ?? device.expiresAt),
    userAgent: normalizeTextValue(device.user_agent ?? device.userAgent),
  };
}

export const deviceService = {
  async getDevices() {
    const response = await axiosInstance.get("/devices");
    return Array.isArray(response.data) ? response.data.map(normalizeDevice) : [];
  },

  async updateDevice({ id, name } = {}) {
    const response = await axiosInstance.patch(
      `/devices/${encodeURIComponent(getRequiredTextValue(id, "Device ID"))}`,
      { name: normalizeTextValue(name) }
    );
    return response.data;
  },

  async deleteDevice({ id } = {}) {
    const response = await axiosInstance.delete(
      `/devices/${encodeURIComponent(getRequiredTextValue(id, "Device ID"))}`
    );
    return response.data;
  },
};
