import type { AxiosInstance } from "axios";
import { getAdminToken } from "../admin-token";

const PUBLIC_PATHS = ["/api/admin/auth/login"];

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some((p) => path.startsWith(p));
}

export function setupAdminAuthInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use((config) => {
    config.withCredentials = true;

    const url = config.url ?? "";
    if (!isPublicPath(url)) {
      const token = getAdminToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  });
}
