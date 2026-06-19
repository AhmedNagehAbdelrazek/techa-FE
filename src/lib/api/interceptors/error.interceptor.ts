import type { AxiosInstance } from "axios";
import { RefreshQueue } from "../queue";
import { setToken } from "../token";

export function setupErrorInterceptor(
  instance: AxiosInstance,
  refreshQueue: RefreshQueue,
): void {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!refreshQueue.pending) {
        refreshQueue.start();
        try {
          const refreshResponse = await instance.post<{ token?: string }>(
            "/api/auth/refresh",
          );
          if (refreshResponse.data?.token) {
            setToken(refreshResponse.data.token);
          }
          refreshQueue.resolveAll(true);
        } catch (refreshError) {
          refreshQueue.rejectAll(refreshError);
          return Promise.reject(refreshError);
        }
      }

      await refreshQueue.enqueue();
      return instance(originalRequest);
    },
  );
}
