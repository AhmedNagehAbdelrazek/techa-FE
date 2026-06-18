import type { NextRequest } from "next/server";

export function isAuthenticated(request: NextRequest): boolean {
  return request.cookies.has("access_token");
}

export function isAuthPage(pathname: string): boolean {
  return pathname.startsWith("/login") || pathname.startsWith("/register");
}
