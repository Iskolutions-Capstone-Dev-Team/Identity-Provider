import axiosInstance from "../../services/axiosInstance";

export const authService = {
  async login(email, password) {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
      client_id: import.meta.env.VITE_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_REDIRECT_URI,
    });

    return response.data;
  },

  async exchangeCode(code) {
    return axiosInstance.post("/auth/token", {
      grant_type: "authorization_code",
      code,
      client_id: import.meta.env.VITE_CLIENT_ID,
      client_secret: import.meta.env.VITE_CLIENT_SECRET,
      redirect_uri: import.meta.env.VITE_REDIRECT_URI,
    }).then(res => res.data);
  },

  async logout() {
    localStorage.removeItem("access_token");
    return axiosInstance.post("/auth/logout");
  },

  async checkSession() {
    return axiosInstance.get("/auth/session");
  }
};