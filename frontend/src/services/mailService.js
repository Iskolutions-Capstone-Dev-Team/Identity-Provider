import axiosInstance from "./axiosInstance";

const normalizeTextValue = (value) =>
  typeof value === "string" ? value.trim() : "";

export const mailService = {
  async sendInvitation({ email, invitationType }) {
    const payload = {
      email: normalizeTextValue(email),
      invitation_type: normalizeTextValue(invitationType).toLowerCase(),
    };

    const response = await axiosInstance.post("/mail/invitation", payload, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  },
};