import type { AxiosInstance } from "axios";

export function setupAuthInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use((config) => {
    config.withCredentials = true;
    return config;
  });
}
