import type { AxiosInstance } from "axios";
import { getToken } from "../token";

const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/resend-verification",
];

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some((p) => path.startsWith(p));
}

export function setupAuthInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use((config) => {
    config.withCredentials = true;

    const url = config.url ?? "";
    if (!isPublicPath(url)) {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  });
}
