import axiosInstance from "./axiosInstance";

const normalizeTextValue = (value) =>
  typeof value === "string" ? value.trim() : "";

export const mailService = {
  async sendInvitation({ email, accountTypeId }) {
    const payload = {
      email: normalizeTextValue(email),
      account_type_id: Number.parseInt(accountTypeId, 10),
    };

    const response = await axiosInstance.post("/admin/mail/invitation", payload, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  },
};