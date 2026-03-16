import axios from "axios";
import { clearAuthState, getAccessToken } from "../auth/utils/authCookies";
import { refreshAccessToken } from "../auth/utils/tokenRefresh";
import {
  IDP_ERROR_PAGE_PATH,
  isIdpProtectedPath,
  redirectToIdpErrorPage,
} from "../auth/utils/idpErrorPage";
import { buildLoginPath } from "../auth/utils/loginRoute";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const UNAUTHORIZED_PAGE_PATH = "/403";

function isAdminRequest(url = "") {
  return typeof url === "string" && url.includes("/admin");
}

function redirectToUnauthorizedPage() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname === UNAUTHORIZED_PAGE_PATH) {
    return;
  }

  window.location.replace(UNAUTHORIZED_PAGE_PATH);
}

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
    UNAUTHORIZED_PAGE_PATH,
    IDP_ERROR_PAGE_PATH,
  ]);

  if (!publicPaths.has(window.location.pathname)) {
    window.location.replace(buildLoginPath());
  }
}

function redirectAfterForbidden(error) {
  if (typeof window === "undefined") {
    return;
  }

  const requestUrl = error.config?.url ?? "";

  if (!isIdpProtectedPath(window.location.pathname) || !isAdminRequest(requestUrl)) {
    return;
  }

  redirectToUnauthorizedPage();
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
      if (!originalRequest?.skipForbiddenRedirect) {
        redirectAfterForbidden(error);
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