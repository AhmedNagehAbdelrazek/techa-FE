import type { AxiosInstance } from "axios";
import { RefreshQueue } from "../queue";
import { setToken } from "../token";

export function setupErrorInterceptor(
  instance: AxiosInstance,
  refreshQueue: RefreshQueue,
  refreshUrl = "/api/auth/refresh",
  setTokenFn = setToken,
  getRefreshTokenFn?: () => string | null,
  onRefreshFail?: () => void,
): void {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      // ponytail: don't retry a failing refresh endpoint itself
      if (refreshUrl && originalRequest.url?.endsWith(refreshUrl)) {
        onRefreshFail?.();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!refreshQueue.pending) {
        refreshQueue.start();
        try {
          const body = getRefreshTokenFn ? { refreshToken: getRefreshTokenFn() } : undefined;
          const refreshResponse = await instance.post<{ token?: string }>(
            refreshUrl,
            body,
          );
          if (refreshResponse.data?.token) {
            setTokenFn(refreshResponse.data.token);
          }
          refreshQueue.resolveAll(true);
          return instance(originalRequest);  // ponytail: this request triggered refresh, retry directly
        } catch (refreshError) {
          refreshQueue.rejectAll(refreshError);
          onRefreshFail?.();
          return Promise.reject(refreshError);
        }
      }

      await refreshQueue.enqueue();
      return instance(originalRequest);
    },
  );
}
