import axios from "axios";
import { clearAuthState, getAccessToken, getPendingMfaAccessToken } from "../auth/utils/authCookies";
import { getCurrentReturnPath, redirectToAuthorize } from "../auth/utils/authorizeFlow";
import { IDP_ERROR_PAGE_PATH, isIdpProtectedPath } from "../auth/utils/idpErrorPage";
import { buildLoginPath } from "../auth/utils/loginRoute";
import { showForbiddenAlert } from "../utils/forbiddenAlert";
import { storeTokenResponse } from "../auth/utils/authCookies";
import { authService } from "../auth/services/authService";

const REQUEST_TIMEOUT_MS = 10000;
const authClientId = import.meta.env.VITE_CLIENT_ID ?? "";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
});

function redirectAfterUnauthorized() {
  if (typeof window === "undefined") {
    return;
  }

  const publicPaths = new Set([
    "/",
    "/login",
    "/register",
    "/register/set-password",
    "/callback",
    "/logout",
    IDP_ERROR_PAGE_PATH,
  ]);

  if (publicPaths.has(window.location.pathname)) {
    return;
  }

  clearAuthState();

  const didRedirect = redirectToAuthorize(
    authClientId,
    getCurrentReturnPath(),
  );

  if (!didRedirect) {
    window.location.replace(buildLoginPath(authClientId));
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
  const token = getAccessToken() || getPendingMfaAccessToken();

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

    const isTokenExpired = error.response?.data?.error === "token_expired";

    if (
      isTokenExpired &&
      originalRequest &&
      !originalRequest.skipAuthRefresh &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const tokenResponse = await authService.refreshSession(authClientId);
        storeTokenResponse(tokenResponse);

        // Update authorization header for retry
        originalRequest.headers.Authorization = `Bearer ${tokenResponse.access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("[AxiosInterceptors] Token refresh failed:", refreshError);
        redirectAfterUnauthorized();
        return Promise.reject(refreshError);
      }
    }

    if (!originalRequest?.skipUnauthorizedRedirect) {
      redirectAfterUnauthorized();
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;