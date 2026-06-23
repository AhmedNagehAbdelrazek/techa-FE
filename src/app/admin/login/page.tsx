"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/api/admin";
import { setAdminToken } from "@/lib/api/admin-token";
import { useAdminStore } from "@/lib/stores/admin.store";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  useEffect(() => { document.title = "تسجيل دخول الأدمن — TechA"; }, []);
  const router = useRouter();
  const { setAdmin, admin, isAuthenticated,_hydrated } = useAdminStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (_hydrated && admin && isAuthenticated) {
      router.replace("/admin");
    }
  }, [admin, isAuthenticated, router,_hydrated]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await adminLogin({ email, password });

      setAdminToken(res.token);
      setAdmin(res.admin);

      document.cookie = `${AUTH_COOKIE_NAME}=${res.token}; path=/; max-age=86400; SameSite=Lax`;

      router.push("/admin");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your store
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="admin@techa.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
