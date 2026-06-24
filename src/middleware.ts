import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "ar"];
const defaultLocale = "en";

function getPreferredLocale(request: NextRequest): string {
  const cookie = request.cookies.get("locale")?.value;
  if (cookie && locales.includes(cookie)) return cookie;

  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const primary = acceptLang.split(",")[0]?.split("-")[0];
    if (primary && locales.includes(primary)) return primary;
  }
  return defaultLocale;
}

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
].join("; ");

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If path already has a locale prefix, rewrite to the real path
  const pathLocale = locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (pathLocale) {
    const newPath = pathname === `/${pathLocale}` ? "/" : pathname.slice(3);
    request.nextUrl.pathname = newPath;

    const response = NextResponse.rewrite(request.nextUrl);
    response.cookies.set("locale", pathLocale, { path: "/", sameSite: "lax" });

    securityHeaders.forEach(({ key, value }) => response.headers.set(key, value));
    response.headers.set("Content-Security-Policy", cspHeader);
    return response;
  }

  // No locale prefix — redirect so all URLs are consistent
  const locale = getPreferredLocale(request);
  const url = new URL(`/${locale}${pathname}${request.nextUrl.search}`, request.url);
  const response = NextResponse.redirect(url);
  response.cookies.set("locale", locale, { path: "/", sameSite: "lax" });
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
