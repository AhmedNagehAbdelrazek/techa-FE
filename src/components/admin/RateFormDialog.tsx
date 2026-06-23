"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import {
  createAdminRate,
  updateAdminRate,
  adminCouponZoneKeys,
  type AdminShippingRate,
} from "@/lib/api/admin-coupons-zones";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  charge: z.coerce.number().min(0, "Charge must be non-negative"),
  estimated_days_min: z.coerce.number().int().min(1),
  estimated_days_max: z.coerce.number().int().min(1),
  free_above_amount: z.coerce.number().nullable().optional(),
  min_order_amount: z.coerce.number().min(0).default(0),
  max_order_amount: z.coerce.number().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zoneId: string;
  initialData?: AdminShippingRate | null;
}

export function RateFormDialog({ open, onOpenChange, zoneId, initialData }: RateFormDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      charge: 0,
      estimated_days_min: 1,
      estimated_days_max: 5,
      free_above_amount: null,
      min_order_amount: 0,
      max_order_amount: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          charge: initialData.charge,
          estimated_days_min: initialData.estimated_days_min,
          estimated_days_max: initialData.estimated_days_max,
          free_above_amount: initialData.free_above_amount,
          min_order_amount: initialData.min_order_amount,
          max_order_amount: initialData.max_order_amount,
        });
      } else {
        form.reset({
          charge: 0,
          estimated_days_min: 1,
          estimated_days_max: 5,
          free_above_amount: null,
          min_order_amount: 0,
          max_order_amount: null,
        });
      }
    }
  }, [open, initialData, form]);

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      createAdminRate(zoneId, {
        charge: data.charge,
        estimated_days_min: data.estimated_days_min,
        estimated_days_max: data.estimated_days_max,
        free_above_amount: data.free_above_amount ?? null,
        min_order_amount: data.min_order_amount,
        max_order_amount: data.max_order_amount ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCouponZoneKeys.rates(zoneId) });
      onOpenChange(false);
      toast.success("Rate created");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create rate");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!initialData) throw new Error("No rate to update");
      return updateAdminRate(initialData.id, {
        charge: data.charge,
        estimated_days_min: data.estimated_days_min,
        estimated_days_max: data.estimated_days_max,
        free_above_amount: data.free_above_amount ?? null,
        min_order_amount: data.min_order_amount,
        max_order_amount: data.max_order_amount ?? null,
        is_active: initialData.is_active,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCouponZoneKeys.rates(zoneId) });
      onOpenChange(false);
      toast.success("Rate updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update rate");
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
          <DialogTitle>{initialData ? "Edit Rate" : "Add Rate"}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="charge"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Charge *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="estimated_days_min"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Days *</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="estimated_days_max"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Days *</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            name="free_above_amount"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Free Above Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Leave empty for no free shipping"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="min_order_amount"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Order Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="max_order_amount"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Order Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Leave empty for no max"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
