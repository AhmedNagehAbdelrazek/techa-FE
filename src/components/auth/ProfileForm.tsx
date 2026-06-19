"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/forms/Button";
import { Input } from "@/components/forms/Input";
import { FormField } from "@/components/forms/FormField";
import { getMe, updateMe } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth.store";

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
  const [isLoadingProfile, setIsLoadingProfile] = useState(!storeUser);
  const [isSaving, setIsSaving] = useState(false);

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
      } catch {
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchProfile();
  }, [storeUser, setUser, reset]);

  async function onSubmit(data: ProfileFormData) {
    setIsSaving(true);

    try {
      const response = await updateMe({
        name: data.full_name,
        phone: data.phone,
      });
      setUser(response.user);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingProfile) {
    return (
      <div role="status" className="py-8 text-center text-sm text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Full Name" error={errors.full_name?.message} required>
        <Input
          {...register("full_name")}
          placeholder="Ahmed Ali"
          aria-label="Full Name"
          error={!!errors.full_name}
        />
      </FormField>

      <FormField label="Email" required>
        <Input
          value={storeUser?.email || ""}
          disabled
          aria-label="Email"
        />
      </FormField>

      <FormField label="Phone" error={errors.phone?.message} required>
        <Input
          {...register("phone")}
          type="tel"
          placeholder="+966501234567"
          aria-label="Phone"
          error={!!errors.phone}
        />
      </FormField>

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
