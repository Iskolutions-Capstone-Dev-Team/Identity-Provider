import axiosInstance from "./axiosInstance";

const normalizeTextValue = (value) =>
  typeof value === "string" ? value.trim() : "";

const INVITATION_TYPE_ALIASES = Object.freeze({
  "system administrator": "admin",
});

function normalizeInvitationType(value) {
  const normalizedValue = normalizeTextValue(value).toLowerCase();

  return INVITATION_TYPE_ALIASES[normalizedValue] ?? normalizedValue;
}

export const mailService = {
  async sendInvitation({ email, invitationType }) {
    const payload = {
      email: normalizeTextValue(email),
      invitation_type: normalizeInvitationType(invitationType),
    };

    const response = await axiosInstance.post("/admin/mail/invitation", payload, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  },
};