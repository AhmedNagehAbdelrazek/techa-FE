"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/forms/Button";
import { Input } from "@/components/forms/Input";
import { FormField } from "@/components/forms/FormField";
import { PhoneCodeSelect } from "@/components/auth/PhoneCodeSelect";
import { register as registerApi } from "@/lib/api/auth";
import { useTranslation } from "@/lib/i18n/client";
import phoneCodes from "@/lib/data/phoneCodes";
import type { ApiError } from "@/lib/types/auth";

const phoneLengthMap = new Map<string, number | number[]>();
for (const c of phoneCodes) {
  if (c.phone && c.phoneLength !== undefined) {
    for (const code of c.phone) {
      phoneLengthMap.set(code, c.phoneLength);
    }
  }
}

const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
    email: z.string().email("Invalid email address"),
    countryCode: z.string().min(1, "Country code is required"),
    phone: z.string().min(1, "Phone number is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirm_password: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirm_password"],
      });
    }
    const length = phoneLengthMap.get(data.countryCode);
    if (length !== undefined && data.phone) {
      const lengths = Array.isArray(length) ? length : [length];
      if (!lengths.includes(data.phone.length)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            lengths.length === 1
              ? `Phone number must be ${lengths[0]} digits`
              : `Phone number must be ${lengths.slice(0, -1).join(", ")}, or ${lengths[lengths.length - 1]} digits`,
          path: ["phone"],
        });
      }
    }
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { countryCode: "+966" },
  });

  const countryCodeValue = watch("countryCode");
  const password = watch("password");
  const confirmPassword = watch("confirm_password");
  const passwordsMatch = confirmPassword && password === confirmPassword;

  async function onSubmit(data: RegisterFormData) {
    setIsSubmitting(true);
    setServerError(null);

    try {
      await registerApi({
        name: data.full_name,
        email: data.email.toLowerCase(),
        password: data.password,
        phone: data.phone,
        countryCode: data.countryCode,
      });
      toast.success(
        t("Account created! Please check your email for a verification code."),
      );
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      const apiError = error as {
        response?: { status: number; data?: ApiError };
        message?: string;
      };
      const status = apiError.response?.status;
      const resBody = apiError.response?.data;
      const message = resBody?.message;

      if (status === 409) {
        const errMsg = message || t("This email is already registered");
        setError("email", { message: errMsg });
        setServerError(errMsg);
      } else if (status === 422) {
        const errMsg = message || t("Please check your inputs");
        setServerError(errMsg);
        if (resBody?.errors) {
          for (const [field, msg] of Object.entries(resBody.errors)) {
            if (field in data) {
              setError(field as keyof RegisterFormData, { message: msg as string });
            }
          }
        }
      } else if (status === 429) {
        toast.error(message || t("Too many attempts. Please try again later."));
      } else if (status === 400) {
        setServerError(message || t("Invalid request. Please check your inputs."));
      } else if (status && status >= 500) {
        toast.error(t("Server error. Please try again later."));
      } else if (!status) {
        toast.error(t("Network error. Please check your connection."));
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

      <FormField
        label={t("Phone")}
        error={errors.countryCode?.message || errors.phone?.message}
        required
      >
        <div className="flex gap-2">
          <PhoneCodeSelect
            value={countryCodeValue}
            onChange={(val) => setValue("countryCode", val, { shouldValidate: true })}
            error={!!errors.countryCode}
          />
          <Input
            {...register("phone")}
            type="tel"
            inputMode="numeric"
            placeholder={t("Phone number")}
            aria-label={t("Phone")}
            error={!!errors.phone}
            className="min-w-0 flex-1"
          />
        </div>
      </FormField>

      <FormField label={t("Password")} error={errors.password?.message} required>
        <div className="relative">
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder={t("Min. 8 characters")}
            aria-label={t("Password")}
            error={!!errors.password}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            aria-label={showPassword ? t("Hide password") : t("Show password")}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </FormField>

      <FormField
        label={t("Confirm Password")}
        error={errors.confirm_password?.message}
        required
      >
        <div className="relative">
          <Input
            {...register("confirm_password")}
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("Re-enter your password")}
            aria-label={t("Confirm Password")}
            error={!!errors.confirm_password}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-9 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            aria-label={
              showConfirmPassword ? t("Hide password") : t("Show password")
            }
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {confirmPassword && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {passwordsMatch ? (
                <Check size={18} className="text-green-500" />
              ) : (
                <X size={18} className="text-destructive" />
              )}
            </span>
          )}
        </div>
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
