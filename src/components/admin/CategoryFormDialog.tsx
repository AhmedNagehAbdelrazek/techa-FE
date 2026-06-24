"use client";

import { useEffect, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "@/lib/i18n/client";

import {
  createAdminCategory,
  updateAdminCategory,
  adminTaxonomyKeys,
  type AdminCategory,
} from "@/lib/api/admin-taxonomy";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  image_url: z.string().nullable().optional(),
  sort_order: z.coerce.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function sluggify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AdminCategory | null;
  parentId?: string | null;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  initialData,
  parentId,
}: CategoryFormDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const slugManuallyEdited = useRef(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      image_url: "",
      sort_order: 0,
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
          image_url: initialData.image_url ?? "",
          sort_order: initialData.sort_order,
          is_active: initialData.is_active,
        });
      } else {
        form.reset({
          name: "",
          slug: "",
          image_url: "",
          sort_order: 0,
          is_active: true,
        });
      }
    }
  }, [open, initialData, form]);

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      createAdminCategory({
        name: data.name,
        slug: data.slug || sluggify(data.name),
        parent_id: parentId ?? null,
        image_url: data.image_url || null,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTaxonomyKeys.categories() });
      onOpenChange(false);
      toast.success(t("Category created"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to create category"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!initialData) throw new Error("No category to update");
      return updateAdminCategory(initialData.id, {
        name: data.name,
        slug: data.slug || sluggify(data.name),
        image_url: data.image_url || null,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTaxonomyKeys.categories() });
      onOpenChange(false);
      toast.success(t("Category updated"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to update category"));
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
          <DialogTitle>{initialData ? t("Edit Category") : t("Add Category")}</DialogTitle>
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
                    placeholder={t("Category name")}
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
                    placeholder={t("category-slug")}
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
            name="image_url"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Image URL")}</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="sort_order"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Sort Order")}</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
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
