export const appConfig = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  },
  auth: {
    cookieName: "access_token",
    refreshCookieName: "refresh_token",
  },
  theme: {
    storageKey: "theme-preference",
    defaultPalette: "default" as const,
    defaultMode: "light" as const,
  },
  i18n: {
    storageKey: "locale-preference",
    defaultLocale: "en" as const,
  },
} as const;

export function validateConfig(): void {
  if (typeof window === "undefined") return;

  const required = ["NEXT_PUBLIC_API_URL"] as const;

  for (const key of required) {
    if (!process.env[key]) {
      console.warn(`[Config] Missing environment variable: ${key}`);
    }
  }
}
