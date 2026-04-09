import axios from "axios";

const registrationActivationApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

function normalizeTextValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function isInvitationForbiddenError(error) {
  const status = error?.response?.status;
  return status === 401 || status === 403;
}

export const registrationActivationService = {
  async checkInvitation(invitationCode) {
    const normalizedInvitationCode = normalizeTextValue(invitationCode);

    if (!normalizedInvitationCode) {
      throw new Error("Invitation code is required.");
    }

    const response = await registrationActivationApi.get(
      `/activate/${encodeURIComponent(normalizedInvitationCode)}`,
    );

    return response.data;
  },

  async activateAccount({ invitationCode, password } = {}) {
    const normalizedInvitationCode = normalizeTextValue(invitationCode);
    const normalizedPassword = normalizeTextValue(password);

    if (!normalizedInvitationCode) {
      throw new Error("Invitation code is required.");
    }

    if (!normalizedPassword) {
      throw new Error("Password is required.");
    }

    const response = await registrationActivationApi.post(
      "/activate",
      {
        invitation_code: normalizedInvitationCode,
        password: normalizedPassword,
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    return response.data;
  },
};