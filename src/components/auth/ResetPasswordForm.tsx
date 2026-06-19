"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/forms/Button";
import { Input } from "@/components/forms/Input";
import { FormField } from "@/components/forms/FormField";
import { resetPassword } from "@/lib/api/auth";

const resetSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    code: z
      .string()
      .length(6, "Code must be exactly 6 digits")
      .regex(/^\d{6}$/, "Code must be 6 digits"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") || "";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: prefilledEmail, code: "", new_password: "", confirm_password: "" },
  });

  async function onSubmit(data: ResetFormData) {
    setIsSubmitting(true);

    try {
      await resetPassword({
        email: data.email.toLowerCase(),
        code: data.code,
        new_password: data.new_password,
      });
      toast.success("Password reset successfully! Please log in with your new password.");
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

      <FormField label="Reset Code" error={errors.code?.message} required>
        <Input
          {...register("code")}
          placeholder="654321"
          maxLength={6}
          aria-label="6-digit reset code"
          error={!!errors.code}
        />
      </FormField>

      <FormField
        label="New Password"
        error={errors.new_password?.message}
        required
      >
        <Input
          {...register("new_password")}
          type="password"
          placeholder="Min. 8 characters"
          aria-label="New Password"
          error={!!errors.new_password}
        />
      </FormField>

      <FormField
        label="Confirm New Password"
        error={errors.confirm_password?.message}
        required
      >
        <Input
          {...register("confirm_password")}
          type="password"
          placeholder="Re-enter your new password"
          aria-label="Confirm New Password"
          error={!!errors.confirm_password}
        />
      </FormField>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Resetting password..." : "Reset Password"}
      </Button>
    </form>
  );
}
