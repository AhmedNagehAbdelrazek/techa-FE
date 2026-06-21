const ADMIN_TOKEN_KEY = "admin_access_token";

export function getAdminToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}
