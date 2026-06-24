"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/forms/Button";
import { Input } from "@/components/forms/Input";
import { FormField } from "@/components/forms/FormField";
import { getMe, updateMe } from "@/lib/api/auth";
import { uploadFile } from "@/lib/api/payments";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  phone: z.string().min(1, "Phone number is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const storeUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { t } = useTranslation();
  const [isLoadingProfile, setIsLoadingProfile] = useState(!storeUser);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    storeUser?.avatarUrl ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (storeUser) {
      reset({
        full_name: storeUser.name,
        phone: storeUser.phone,
      });
      setAvatarPreview(storeUser.avatarUrl);
      setIsLoadingProfile(false);
      return;
    }

    async function fetchProfile() {
      try {
        const user = await getMe();
        setUser(user);
        reset({
          full_name: user.name,
          phone: user.phone,
        });
        setAvatarPreview(user.avatarUrl);
      } catch {
        toast.error(t("Failed to load profile. Please try again."));
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchProfile();
  }, [storeUser, setUser, reset, t]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(t("File size must be less than 20MB"));
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("Only JPEG, PNG, WebP, and GIF files are accepted"));
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const { url } = await uploadFile(file);
      setAvatarPreview(url);

      const response = await updateMe({ avatar_url: url });
      setUser(response.user);
      toast.success(t("Avatar updated successfully!"));
    } catch {
      setAvatarPreview(storeUser?.avatarUrl ?? null);
      toast.error(t("Failed to upload avatar. Please try again."));
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function onSubmit(data: ProfileFormData) {
    setIsSaving(true);

    try {
      const response = await updateMe({
        name: data.full_name,
        phone: data.phone,
      });
      setUser(response.user);
      toast.success(t("Profile updated successfully!"));
    } catch {
      toast.error(t("Failed to update profile. Please try again."));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingProfile) {
    return (
      <div role="status" className="py-8 text-center text-sm text-muted-foreground">
        {t("Loading profile...")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div
            className={cn(
              "size-20 rounded-full overflow-hidden bg-muted flex items-center justify-center",
              isUploadingAvatar && "opacity-50",
            )}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={t("Your avatar")}
                className="size-full object-cover"
              />
            ) : (
              <Camera className="size-8 text-muted-foreground" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute bottom-0 right-0 size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
            aria-label={t("Upload avatar")}
          >
            {isUploadingAvatar ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Camera className="size-4" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
            aria-label={t("Choose avatar file")}
          />
        </div>
      </div>

      <FormField label={t("Full Name")} error={errors.full_name?.message} required>
        <Input
          {...register("full_name")}
          placeholder={t("Ahmed Ali")}
          aria-label={t("Full Name")}
          error={!!errors.full_name}
        />
      </FormField>

      <FormField label={t("Email")} required>
        <Input
          value={storeUser?.email || ""}
          disabled
          aria-label={t("Email")}
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

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? t("Saving...") : t("Save Changes")}
      </Button>
    </form>
  );
}
