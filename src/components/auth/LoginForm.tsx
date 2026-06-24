"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/forms/Button";
import { Input } from "@/components/forms/Input";
import { FormField } from "@/components/forms/FormField";
import { login as loginApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth.store";
import { setToken } from "@/lib/api/token";
import { useTranslation } from "@/lib/i18n/client";
import type { ApiError } from "@/lib/types/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const login = useAuthStore((state) => state.login);
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await loginApi({
        email: data.email.toLowerCase(),
        password: data.password,
      });
      setToken(response.token);
      login(response.user);
      toast.success(t("Welcome back!"));
      router.push(next);
    } catch (error: unknown) {
      const apiError = error as {
        response?: { status: number; data?: ApiError };
      };
      const status = apiError.response?.status;
      const message = apiError.response?.data?.message;

      if (status === 403) {
        setError("email", {
          message: message || t("Please verify your email before logging in"),
        });
      } else if (status === 401) {
        setError("password", {
          message: message || t("Invalid email or password"),
        });
      } else if (status === 429) {
        toast.error(message || t("Too many attempts. Please try again later."));
      } else {
        toast.error(message || t("Something went wrong. Please try again."));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      <FormField label={t("Email")} error={errors.email?.message} required>
        <Input
          {...register("email")}
          type="email"
          placeholder={t("ahmed@example.com")}
          aria-label={t("Email")}
          error={!!errors.email}
        />
      </FormField>

      <FormField label={t("Password")} error={errors.password?.message} required>
        <Input
          {...register("password")}
          type="password"
          placeholder={t("Enter your password")}
          aria-label={t("Password")}
          error={!!errors.password}
        />
      </FormField>

      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          {t("Forgot password?")}
        </Link>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? t("Logging in...") : t("Log In")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("Don't have an account?")}{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          {t("Create one")}
        </Link>
      </p>
    </form>
  );
}
