"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/forms/Button";
import { Input } from "@/components/forms/Input";
import { FormField } from "@/components/forms/FormField";
import { register as registerApi } from "@/lib/api/auth";
import { useTranslation } from "@/lib/i18n/client";
import type { ApiError } from "@/lib/types/auth";

const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setIsSubmitting(true);
    setServerError(null);

    try {
      await registerApi({
        name: data.full_name,
        email: data.email.toLowerCase(),
        password: data.password,
        phone: data.phone,
      });
      toast.success(
        t("Account created! Please check your email for a verification code."),
      );
      router.push("/verify-email");
    } catch (error: unknown) {
      const apiError = error as {
        response?: { status: number; data?: ApiError };
      };
      const status = apiError.response?.status;
      const message = apiError.response?.data?.message;

      if (status === 409) {
        setError("email", {
          message: message || t("This email is already registered"),
        });
      } else if (status === 422) {
        setServerError(message || t("Please check your inputs"));
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

      <FormField label={t("Full Name")} error={errors.full_name?.message} required>
        <Input
          {...register("full_name")}
          placeholder={t("Ahmed Ali")}
          aria-label={t("Full Name")}
          error={!!errors.full_name}
        />
      </FormField>

      <FormField label={t("Email")} error={errors.email?.message} required>
        <Input
          {...register("email")}
          type="email"
          placeholder={t("ahmed@example.com")}
          aria-label={t("Email")}
          error={!!errors.email}
        />
      </FormField>

      <FormField label={t("Phone")} error={errors.phone?.message} required>
        <Input
          {...register("phone")}
          type="tel"
          placeholder="+966501234567"
          aria-label={t("Phone")}
          error={!!errors.phone}
        />
      </FormField>

      <FormField label={t("Password")} error={errors.password?.message} required>
        <Input
          {...register("password")}
          type="password"
          placeholder={t("Min. 8 characters")}
          aria-label={t("Password")}
          error={!!errors.password}
        />
      </FormField>

      <FormField
        label={t("Confirm Password")}
        error={errors.confirm_password?.message}
        required
      >
        <Input
          {...register("confirm_password")}
          type="password"
          placeholder={t("Re-enter your password")}
          aria-label={t("Confirm Password")}
          error={!!errors.confirm_password}
        />
      </FormField>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? t("Creating account...") : t("Create Account")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("Already have an account?")}{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          {t("Log in")}
        </Link>
      </p>
    </form>
  );
}
