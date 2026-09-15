import axios, { type AxiosInstance } from "axios";

import { getApiBaseUrl, getApiOrigin } from "@/lib/api/config";
import { clearAuthenticated, getAuthToken } from "@/lib/auth-session";

function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      if (status === 401 && getAuthToken()) {
        clearAuthenticated();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("sportxo:auth-expired"));
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
}

/** Authenticated Sportxo API v1 client (`/api/v1/*`). */
export const apiClient = createApiClient(getApiBaseUrl());

/** Root API client for routes outside `/api/v1` (e.g. `GET /api/me`). */
export const apiRootClient = createApiClient(getApiOrigin());
