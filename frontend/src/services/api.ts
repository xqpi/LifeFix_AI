import axios from "axios";
import { getStoredToken, removeStoredToken } from "./tokenStorage";

export type UnauthorizedCallback = () => void;

let unauthorizedCallback: UnauthorizedCallback | null = null;

/**
 * Register an auth listener callback that will be called when an authenticated
 * API request receives a 401 Unauthorized response from the backend.
 */
export function setUnauthorizedCallback(callback: UnauthorizedCallback | null): void {
  unauthorizedCallback = callback;
}

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Centralized Request Interceptor: Attach Bearer JWT if available
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized Response Interceptor: Handle 401 Unauthorized sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";

      // Do NOT trigger session logout on failed login attempts (e.g. wrong password)
      if (!requestUrl.includes("/api/auth/login")) {
        removeStoredToken();
        if (unauthorizedCallback) {
          unauthorizedCallback();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;