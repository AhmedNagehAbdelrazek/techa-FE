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

      originalRequest._retry = true;

      if (!refreshQueue.pending) {
        refreshQueue.start();
        console.log("refreshing token");
        try {
          const body = getRefreshTokenFn ? { refreshToken: getRefreshTokenFn() } : undefined;  // ponytail: send stored refreshToken
          const refreshResponse = await instance.post<{ token?: string }>(
            refreshUrl,
            body,
          );
          if (refreshResponse.data?.token) {
            setTokenFn(refreshResponse.data.token);
          }
          refreshQueue.resolveAll(true);
          console.log("token refreshed");
        } catch (refreshError) {
          console.log("refresh error");
          refreshQueue.rejectAll(refreshError);
          onRefreshFail?.();  // ponytail: de-authenticate on refresh failure
          return Promise.reject(refreshError);
        }
      }

      await refreshQueue.enqueue();
      return instance(originalRequest);
    },
  );
}
