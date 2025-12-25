import axios from "axios";
import { STORAGE_KEYS, API_ENDPOINTS } from "../constants";
import { getApiUrl } from "../utils/config";

// Create axios instance with default config
const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API endpoints
export const authAPI = {
  signup: async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    const response = await api.post(API_ENDPOINTS.SIGNUP, userData);
    return response.data;
  },

  signin: async (credentials: { email: string; password: string }) => {
    const response = await api.post(API_ENDPOINTS.SIGNIN, credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post(API_ENDPOINTS.LOGOUT);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get(API_ENDPOINTS.PROFILE);
    return response.data;
  },

  // OAuth endpoints
  googleLogin: () => {
    window.location.href = `${api.defaults.baseURL}${API_ENDPOINTS.GOOGLE_OAUTH}`;
  },

  githubLogin: () => {
    window.location.href = `${api.defaults.baseURL}${API_ENDPOINTS.GITHUB_OAUTH}`;
  },

  // Email verification endpoints
  verifyEmail: async (email: string, otp: string) => {
    const response = await api.post("/auth/verify-email", { email, otp });
    return response;
  },

  resendVerificationOTP: async (email: string) => {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  },

  // Password reset endpoints
  requestPasswordReset: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  verifyPasswordResetOTP: async (email: string, otp: string) => {
    const response = await api.post("/auth/verify-reset-otp", { email, otp });
    return response.data;
  },

  resetPassword: async (
    resetToken: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    const response = await api.post("/auth/reset-password", {
      resetToken,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

// Code execution API
export const codeAPI = {
  executeCode: async (code: string, language: string, input?: string) => {
    const response = await api.post(API_ENDPOINTS.CODE_EXECUTE, {
      code,
      language,
      input,
    });
    return response.data;
  },
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data;

    // Handle suspended accounts (403 status)
    if (
      error.response?.status === 403 &&
      (errorData?.isSuspended || errorData?.accountStatus === "suspended")
    ) {
      // Clear auth data
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      // Store suspension message for display on signin page
      sessionStorage.setItem(
        "accountSuspendedMessage",
        errorData?.message || "Your account has been suspended."
      );

      // Redirect to signin page
      window.location.href = "/signin";
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // Only redirect if it's a token expiry, not email verification issues

      // Don't redirect for email verification errors
      if (errorData?.needsEmailVerification) {
        return Promise.reject(error);
      }

      // Check if this is an admin endpoint (they should always redirect on 401)
      const requestUrl = error.config?.url || "";
      if (requestUrl.includes("/admin/")) {
        // Don't redirect for admin endpoints, let them handle their own auth
        return Promise.reject(error);
      }

      // Only redirect for actual token expiry/invalid token on non-admin endpoints
      if (
        errorData?.message?.includes("token") ||
        errorData?.message?.includes("expired") ||
        errorData?.message?.includes("invalid")
      ) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

