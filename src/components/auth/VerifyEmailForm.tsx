"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/forms/Button";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/forms/Input";
import {
  verifyEmail,
  resendVerification,
} from "@/lib/api/auth";

const verifySchema = z.object({
  code: z
    .string()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
  email: z.string().email("Invalid email"),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: { email: prefilledEmail, code: "" },
  });

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function onSubmit(data: VerifyFormData) {
    setIsSubmitting(true);

    try {
      await verifyEmail({ email: data.email, code: data.code });
      toast.success("Email verified successfully! You can now log in.");
      router.push("/login");
    } catch (error: unknown) {
      const apiError = error as {
        response?: { status: number; data?: { message?: string } };
      };
      const message = apiError.response?.data?.message;
      setError("code", {
        message: message || "Invalid or expired code. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);

    try {
      const email = prefilledEmail;
      if (!email) {
        toast.error("Email is required to resend the code.");
        return;
      }
      await resendVerification({ email });
      toast.success("Verification code sent to your email.");
    } catch {
      toast.error("Failed to resend code. Please try again.");
      setResendCooldown(0);
    }
  }, [prefilledEmail, resendCooldown]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Email" error={errors.email?.message} required>
        <Input
          {...register("email")}
          type="email"
          placeholder="ahmed@example.com"
          aria-label="Email"
          error={!!errors.email}
        />
      </FormField>

      <FormField label="Verification Code" error={errors.code?.message} required>
        <Input
          {...register("code")}
          placeholder="123456"
          maxLength={6}
          aria-label="6-digit verification code"
          error={!!errors.code}
        />
      </FormField>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Verifying..." : "Verify Email"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : "Resend code"}
        </button>
      </div>
    </form>
  );
}
