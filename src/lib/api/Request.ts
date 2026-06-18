import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./endpoints";
import { setupAuthInterceptor } from "./interceptors/auth.interceptor";
import { setupErrorInterceptor } from "./interceptors/error.interceptor";
import { RefreshQueue } from "./queue";

class Request {
  private instance: AxiosInstance;
  private refreshQueue: RefreshQueue;

  constructor(baseURL: string) {
    this.refreshQueue = new RefreshQueue();
    this.instance = axios.create({ baseURL, withCredentials: true });
    setupAuthInterceptor(this.instance);
    setupErrorInterceptor(this.instance, this.refreshQueue);
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

export const request = new Request(API_BASE_URL);
