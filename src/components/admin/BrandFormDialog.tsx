"use client";

import { useEffect, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "@/lib/i18n/client";

import {
  createAdminBrand,
  updateAdminBrand,
  adminTaxonomyKeys,
  type AdminBrand,
} from "@/lib/api/admin-taxonomy";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  logo_url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function sluggify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface BrandFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AdminBrand | null;
}

export function BrandFormDialog({ open, onOpenChange, initialData }: BrandFormDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const slugManuallyEdited = useRef(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo_url: "",
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      slugManuallyEdited.current = false;
      if (initialData) {
        form.reset({
          name: initialData.name,
          slug: initialData.slug,
          logo_url: initialData.logo_url ?? "",
          description: initialData.description ?? "",
          is_active: initialData.is_active,
        });
      } else {
        form.reset({
          name: "",
          slug: "",
          logo_url: "",
          description: "",
          is_active: true,
        });
      }
    }
  }, [open, initialData, form]);

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      createAdminBrand({
        name: data.name,
        slug: data.slug || sluggify(data.name),
        logo_url: data.logo_url || null,
        description: data.description || null,
        is_active: data.is_active ?? true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTaxonomyKeys.brands() });
      onOpenChange(false);
      toast.success(t("Brand created"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to create brand"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!initialData) throw new Error("No brand to update");
      return updateAdminBrand(initialData.id, {
        name: data.name,
        slug: data.slug || sluggify(data.name),
        logo_url: data.logo_url || null,
        description: data.description || null,
        is_active: data.is_active ?? true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTaxonomyKeys.brands() });
      onOpenChange(false);
      toast.success(t("Brand updated"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to update brand"));
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? t("Edit Brand") : t("Add Brand")}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Name *")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Brand name")}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (!slugManuallyEdited.current) {
                        form.setValue("slug", sluggify(e.target.value));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="slug"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Slug")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("brand-slug")}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      slugManuallyEdited.current = true;
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="logo_url"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Logo URL")}</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Description")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Brand description")}
                    className="min-h-[80px]"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="is_active"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value ?? true} onCheckedChange={field.onChange} />
                  </FormControl>
                  <Label>{t("Active")}</Label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("Cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {initialData ? t("Update") : t("Create")}
            </Button>
          </div>
        </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
