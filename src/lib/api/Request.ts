import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { API_BASE_URL, AUTH_REFRESH_URL } from "./endpoints";
import { setupAuthInterceptor } from "./interceptors/auth.interceptor";
import { setupErrorInterceptor } from "./interceptors/error.interceptor";
import { RefreshQueue } from "./queue";
import { setToken, getRefreshToken } from "./token";
import { useAuthStore } from "@/lib/stores/auth.store";

class Request {
  private instance: AxiosInstance;
  private refreshQueue: RefreshQueue;

  constructor(baseURL: string) {
    this.refreshQueue = new RefreshQueue();
    this.instance = axios.create({ baseURL, withCredentials: true });
    setupAuthInterceptor(this.instance);
    setupErrorInterceptor(this.instance, this.refreshQueue, AUTH_REFRESH_URL, setToken, getRefreshToken, () =>
      useAuthStore.getState().logout(),
    );  // ponytail: send refreshToken, de-auth on fail
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get<T>(url, config).then((res) => res.data);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post<T>(url, data, config).then((res) => res.data);
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put<T>(url, data, config).then((res) => res.data);
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.patch<T>(url, data, config).then((res) => res.data);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete<T>(url, config).then((res) => res.data);
  }
}

const isServer = typeof window === "undefined";

let baseURL: string;
if (isServer) {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  baseURL = rawUrl.replace(/\/api\/v1\/?$/, "");
} else {
  baseURL = API_BASE_URL || "/api/v1";
}

export const request = new Request(baseURL);
