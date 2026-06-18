import { AUTH_COOKIE_NAME } from "./constants";

export function getToken(): string | undefined {
  if (typeof document === "undefined") return undefined;

  const cookies = document.cookie.split(";").map((c) => c.trim());
  const authCookie = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
  return authCookie?.split("=")[1];
}
