import axios from "axios";
import { clearAuthState, getAccessToken } from "../auth/utils/authCookies";
import { refreshAccessToken } from "../auth/utils/tokenRefresh";
import { IDP_ERROR_PAGE_PATH, isIdpProtectedPath, redirectToIdpErrorPage } from "../auth/utils/idpErrorPage";
import { buildLoginPath } from "../auth/utils/loginRoute";
import { showForbiddenAlert } from "../utils/forbiddenAlert";

const REQUEST_TIMEOUT_MS = 10000;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
});

function redirectAfterUnauthorized(error) {
  if (typeof window === "undefined") {
    return;
  }

  if (isIdpProtectedPath(window.location.pathname)) {
    redirectToIdpErrorPage(error);
    return;
  }

  const publicPaths = new Set([
    "/",
    "/login",
    "/callback",
    IDP_ERROR_PAGE_PATH,
  ]);

  if (!publicPaths.has(window.location.pathname)) {
    window.location.replace(buildLoginPath());
  }
}

function showForbiddenAccessAlert() {
  if (typeof window === "undefined") {
    return;
  }

  if (!isIdpProtectedPath(window.location.pathname)) {
    return;
  }

  showForbiddenAlert();
}

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
    const status = error.response?.status;
    const originalRequest = error.config;

    if (status === 403) {
      if (
        !originalRequest?.skipForbiddenRedirect &&
        !originalRequest?.skipForbiddenAlert
      ) {
        showForbiddenAccessAlert();
      }

      return Promise.reject(error);
    }

    if (status !== 401) {
      return Promise.reject(error);
    }

    if (!originalRequest || originalRequest.skipAuthRefresh || originalRequest._retry) {
      redirectAfterUnauthorized(error);
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();

      if (!accessToken) {
        clearAuthState();
        redirectAfterUnauthorized(error);
        return Promise.reject(error);
      }

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      clearAuthState();
      redirectAfterUnauthorized(refreshError);
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;