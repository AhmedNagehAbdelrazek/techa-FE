"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/client";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { X } from "lucide-react";

import {
  createAdminZone,
  updateAdminZone,
  adminCouponZoneKeys,
  type AdminZone,
} from "@/lib/api/admin-coupons-zones";
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
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface ZoneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AdminZone | null;
}

export function ZoneFormDialog({ open, onOpenChange, initialData }: ZoneFormDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [regions, setRegions] = useState<string[]>([]);
  const [regionInput, setRegionInput] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", is_active: true },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({ name: initialData.name, is_active: initialData.is_active });
        setRegions(initialData.regions);
      } else {
        form.reset({ name: "", is_active: true });
        setRegions([]);
      }
      setRegionInput("");
    }
  }, [open, initialData, form]);

  function addRegion() {
    const trimmed = regionInput.trim();
    if (trimmed && !regions.includes(trimmed)) {
      setRegions([...regions, trimmed]);
    }
    setRegionInput("");
  }

  function removeRegion(region: string) {
    setRegions(regions.filter((r) => r !== region));
  }

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      createAdminZone({ name: data.name, regions, is_active: data.is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCouponZoneKeys.zones() });
      onOpenChange(false);
      toast.success(t("Zone created"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to create zone"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!initialData) throw new Error("No zone to update");
      return updateAdminZone(initialData.id, { name: data.name, regions, is_active: data.is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCouponZoneKeys.zones() });
      onOpenChange(false);
      toast.success(t("Zone updated"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to update zone"));
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: FormValues) {
    if (regions.length === 0) {
      toast.error(t("Add at least one region"));
      return;
    }
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
          <DialogTitle>{initialData ? t("Edit Zone") : t("Add Zone")}</DialogTitle>
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
                  <Input placeholder={t("Zone name")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>{t("Regions *")}</FormLabel>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {regions.map((region) => (
                <Badge key={region} variant="secondary" className="gap-1">
                  {region}
                  <button type="button" onClick={() => removeRegion(region)} className="hover:text-destructive">
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={t("Type a region and press Add")}
                value={regionInput}
                onChange={(e) => setRegionInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRegion(); } }}
              />
              <Button type="button" variant="outline" onClick={addRegion} disabled={!regionInput.trim()}>
                {t("Add")}
              </Button>
            </div>
            <FormMessage />
          </FormItem>
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
