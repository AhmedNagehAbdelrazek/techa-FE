"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { createBanner, updateBanner, adminBannerSettingsKeys, type AdminBanner } from "@/lib/api/admin-banners-settings-media";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional().or(z.literal("")),
  image_url: z.string().url("Must be a valid URL").min(1, "Image URL is required"),
  link_url: z.string().optional().or(z.literal("")),
  position: z.enum(["hero", "promo", "sidebar", "bottom"]),
  sort_order: z.coerce.number().int().min(0).default(0),
  starts_at: z.string().min(1, "Start date is required"),
  ends_at: z.string().optional().or(z.literal("")), //   empty string = null = never expires
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface BannerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AdminBanner | null;
}

export function BannerFormDialogSkeleton() {
  return null; //   Dialog is small enough that a skeleton adds no value
}

export function BannerFormDialog({ open, onOpenChange, initialData }: BannerFormDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "", image_url: "", link_url: "", position: "hero", sort_order: 0, starts_at: "", ends_at: "", is_active: true },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          title: initialData.title,
          description: initialData.description ?? "",
          image_url: initialData.image_url,
          link_url: initialData.link_url ?? "",
          position: initialData.position as "hero" | "promo" | "sidebar" | "bottom",
          sort_order: initialData.sort_order,
          starts_at: initialData.starts_at?.split("T")[0],
          ends_at: initialData.ends_at?.split("T")[0] ?? "",
          is_active: initialData.is_active,
        });
      } else {
        form.reset({ title: "", description: "", image_url: "", link_url: "", position: "hero", sort_order: 0, starts_at: "", ends_at: "", is_active: true });
      }
    }
  }, [open, initialData, form]);

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => createBanner({ ...data, ends_at: data.ends_at || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBannerSettingsKeys.banners() });
      onOpenChange(false);
      toast.success("Banner created");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to create banner"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!initialData) throw new Error("No banner to update");
      return updateBanner(initialData.id, { ...data, ends_at: data.ends_at || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBannerSettingsKeys.banners() });
      onOpenChange(false);
      toast.success("Banner updated");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update banner"),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: FormValues) {
    if (initialData) updateMutation.mutate(data);
    else createMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Banner" : "Add Banner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/*   no FormProvider wrappers — raw form elements keep it simple */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...form.register("title")} placeholder="Summer Sale" />
            {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} placeholder="Get 50% off on all items" />
          </div>
          <div>
            <Label htmlFor="image_url">Image URL *</Label>
            <div className="flex gap-2">
              <Input id="image_url" {...form.register("image_url")} placeholder="https://..." className="flex-1" />
              {form.watch("image_url") && (
                <img src={form.watch("image_url")} alt="Preview" className="size-10 rounded object-cover" /> //   inline preview
              )}
            </div>
            {form.formState.errors.image_url && <p className="text-sm text-destructive">{form.formState.errors.image_url.message}</p>}
          </div>
          <div>
            <Label htmlFor="link_url">Link URL</Label>
            <Input id="link_url" {...form.register("link_url")} placeholder="https://techa.com/sale" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Position *</Label>
              <Select onValueChange={(v) => form.setValue("position", v as "hero" | "promo" | "sidebar" | "bottom")} defaultValue={form.watch("position")}>
                <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input id="sort_order" type="number" {...form.register("sort_order")} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="starts_at">Start Date *</Label>
              <Input id="starts_at" type="date" {...form.register("starts_at")} />
              {form.formState.errors.starts_at && <p className="text-sm text-destructive">{form.formState.errors.starts_at.message}</p>}
            </div>
            <div>
              <Label htmlFor="ends_at">End Date</Label>
              <Input id="ends_at" type="date" {...form.register("ends_at")} /> {/*   optional = never expires */}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.watch("is_active")} onChange={(e) => form.setValue("is_active", e.target.checked)} className="size-4" /> {/*   native checkbox */}
            <Label htmlFor="is_active">Active</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{initialData ? "Update" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
