import type { AxiosInstance } from "axios";
import { RefreshQueue } from "../queue";

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
          await instance.post("/api/auth/refresh");
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
