"use client";

import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { createAdmin, updateAdmin, getRoles, adminAdminsRolesKeys, type AdminAccount } from "@/lib/api/admin-admins-roles";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email format"),
  //   password required on create, optional on edit — handled by context below
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  role_id: z.string({ required_error: "Role is required" }).min(1, "Role is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AdminAccount | null;
}

export function AdminFormDialog({ open, onOpenChange, initialData }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: roles } = useQuery({
    queryKey: adminAdminsRolesKeys.roles(),
    queryFn: getRoles,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", role_id: "" },
  });

  useEffect(() => {
    if (open) {
      let roleId = "";
      if (initialData) {
        if (typeof initialData.role === "object") {
          roleId = String(initialData.role.id);
        } else if (roles) {
          //   role is a string from list — match name to find ID
          const match = roles.find((r) => r.name === initialData.role);
          if (match) roleId = match.id;
        }
      }
      reset({ name: initialData?.name ?? "", email: initialData?.email ?? "", password: "", role_id: roleId });
    }
  }, [open, initialData, roles, reset]);

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => createAdmin({
      name: data.name,
      email: data.email,
      password: data.password!,
      role_id: Number(data.role_id),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAdminsRolesKeys.admins() });
      onOpenChange(false);
      toast.success(t("Admin created"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to create admin"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!initialData) throw new Error("No admin to update");
      return updateAdmin(initialData.id, {
        name: data.name,
        email: data.email,
        ...(data.password ? { password: data.password } : {}),
        role_id: Number(data.role_id),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAdminsRolesKeys.admins() });
      onOpenChange(false);
      toast.success(t("Admin updated"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to update admin"));
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: FormValues) {
    if (initialData) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  //   inline form, no FormProvider — simple enough
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{initialData ? t("Edit Admin") : t("Create Admin")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("Full Name *")}</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("Email *")}</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              {t("Password")} {initialData ? t("(leave blank to keep unchanged)") : "*"}
            </Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role_id">{t("Role *")}</Label>
            {/*   native select — works with react-hook-form register, avoids shadcn Select complexity */}
            <select
              id="role_id"
              {...register("role_id")}
              disabled={!roles?.length}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{roles?.length ? t("Select role...") : roles === undefined ? t("Loading...") : t("No roles available")}</option>
              {roles?.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            {errors.role_id && <p className="text-sm text-destructive">{errors.role_id.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("Cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {initialData ? t("Update") : t("Create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
