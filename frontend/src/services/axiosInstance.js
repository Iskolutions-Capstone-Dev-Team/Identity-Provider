import axios from "axios";
import { clearAuthState, getAccessToken } from "../auth/utils/authCookies";
import { refreshAccessToken } from "../auth/utils/tokenRefresh";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.skipAuthRefresh ||
      error.response?.status !== 401
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();

      if (!accessToken) {
        throw error;
      }

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      clearAuthState();

      if (typeof window !== "undefined") {
        const publicPaths = new Set(["/", "/callback", "/401"]);

        if (!publicPaths.has(window.location.pathname)) {
          window.location.replace("/");
        }
      }

      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;
