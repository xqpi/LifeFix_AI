import axios from "axios";
import type {
  AttemptDetailResponse,
  AttemptHistoryResponse,
  LifeFixSolutionResponse,
  RefineProblemRequest,
} from "../types";
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
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
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

/**
 * Fetch paginated problem attempt history for the authenticated user.
 * GET /api/attempts/history?page={page}&limit={limit}
 */
export async function getAttemptHistory(
  page: number = 1,
  limit: number = 20
): Promise<AttemptHistoryResponse> {
  const response = await api.get<AttemptHistoryResponse>("/api/attempts/history", {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Fetch a single detailed problem attempt for the authenticated user.
 * GET /api/attempts/{attempt_id}
 */
export async function getAttempt(attemptId: string): Promise<AttemptDetailResponse> {
  const response = await api.get<AttemptDetailResponse>(`/api/attempts/${attemptId}`);
  return response.data;
}

/**
 * Refine an unsuccessful problem attempt with additional context, producing a new child attempt.
 * POST /api/attempts/{attempt_id}/refine
 */
export async function refineAttempt(
  attemptId: string,
  payload: RefineProblemRequest
): Promise<LifeFixSolutionResponse> {
  const response = await api.post<LifeFixSolutionResponse>(
    `/api/attempts/${attemptId}/refine`,
    payload
  );
  return response.data;
}

export default api;