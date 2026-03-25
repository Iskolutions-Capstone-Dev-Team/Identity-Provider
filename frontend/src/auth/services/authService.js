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

function getRegisterRequestConfig() {
  const apiKey = import.meta.env.BACKEND_API_KEY;
  const headers = {};

  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  return {
    headers,
    skipAuthRefresh: true,
  };
}

async function postToFirstAvailableRoute(routes, payload) {
  let lastNotFoundError = null;

  for (const route of routes) {
    try {
      const response = await axiosInstance.post(route, payload, {
        skipAuthRefresh: true,
      });

      return response.data;
    } catch (error) {
      if (error.response?.status !== 404) {
        throw error;
      }

      lastNotFoundError = error;
    }
  }

  throw lastNotFoundError || new Error("The requested endpoint is not available.");
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
  },

  async checkAdminAccess() {
    return axiosInstance.get("/admin/users", {
      params: { page: 1 },
      skipForbiddenRedirect: true,
    });
  },

  async requestOtp(email) {
    const response = await axiosInstance.post("/otp", {
      email,
    }, {
      skipAuthRefresh: true,
    });

    if (response.status !== 200) {
      throw new Error("Unexpected OTP response.");
    }

    return response.data;
  },

  async resendOtp(email) {
    return this.requestOtp(email);
  },

  async validateOtp(email, code) {
    // Support both route names while the frontend and backend contracts are aligned.
    return postToFirstAvailableRoute(
      ["/otp/validate", "/otp/verify"],
      {
        email,
        code,
      },
    );
  },

  async register(payload) {
    const response = await axiosInstance.post(
      "/register",
      payload,
      getRegisterRequestConfig(),
    );

    return response.data;
  },
};
