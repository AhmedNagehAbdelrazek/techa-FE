"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/forms/Button";
import { Input } from "@/components/forms/Input";
import { FormField } from "@/components/forms/FormField";
import { forgotPassword } from "@/lib/api/auth";
import { useTranslation } from "@/lib/i18n/client";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  async function onSubmit(data: ForgotFormData) {
    setIsSubmitting(true);

    try {
      await forgotPassword({ email: data.email.toLowerCase() });
      setIsSuccess(true);
    } catch {
      // Always show success to prevent email enumeration
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div role="status" className="rounded-md bg-primary/10 p-4 text-sm text-primary">
          {t("If an account exists with this email, a reset code has been sent. Please check your email.")}
        </div>
        <Link
          href="/login"
          className="text-sm text-primary hover:underline"
        >
          {t("Back to login")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label={t("Email")} error={errors.email?.message} required>
        <Input
          {...register("email")}
          type="email"
          placeholder={t("ahmed@example.com")}
          aria-label={t("Email")}
          error={!!errors.email}
        />
      </FormField>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? t("Sending reset code...") : t("Send Reset Code")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          {t("Back to login")}
        </Link>
      </p>
    </form>
  );
}
