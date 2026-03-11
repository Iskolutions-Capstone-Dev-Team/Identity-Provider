import axiosInstance from "../../services/axiosInstance";

function getLoginRedirectUrl(data) {
  if (typeof data === "string") {
    return data;
  }

  if (typeof data?.redirect_to === "string") {
    return data.redirect_to;
  }

  if (typeof data?.redirect_url === "string") {
    return data.redirect_url;
  }

  return "";
}

export const authService = {

  async login(email, password, clientId) {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
      client_id: clientId,
    }, {
      skipAuthRefresh: true,
    });

    return getLoginRedirectUrl(response.data);
  },

  async exchangeCode(code) {
    const response = await axiosInstance.post("/auth/token", {
      code,
      client_id: import.meta.env.VITE_CLIENT_ID,
      client_secret: import.meta.env.VITE_CLIENT_SECRET,
    }, {
      skipAuthRefresh: true,
    });

    return response.data;
  },

  async logout() {
    return axiosInstance.post("/auth/logout", null, {
      skipAuthRefresh: true,
    });
  },

  async checkSession() {
    return axiosInstance.get("/auth/session", {
      skipAuthRefresh: true,
    });
  }

};
