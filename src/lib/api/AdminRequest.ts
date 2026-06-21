import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./endpoints";
import { setupAdminAuthInterceptor } from "./interceptors/admin-auth.interceptor";

class AdminRequest {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({ baseURL, withCredentials: true });
    setupAdminAuthInterceptor(this.instance);
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

export const adminRequest = new AdminRequest(baseURL);
