import axiosInstance from "../../services/axiosInstance";

export const authService = {

  async login(email, password) {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
      client_id: import.meta.env.VITE_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_REDIRECT_URI,
    }, {
      skipAuthRefresh: true,
    });

    return response.data;
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
