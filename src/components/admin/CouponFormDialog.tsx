"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";

import {
  createAdminCoupon,
  updateAdminCoupon,
  adminCouponZoneKeys,
  type AdminCoupon,
} from "@/lib/api/admin-coupons-zones";
import { getProducts } from "@/lib/api/admin-products";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  code: z.string().min(1, "Code is required").max(50),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.coerce.number().min(0.01, "Value must be positive"),
  product_id: z.string().nullable(),
  min_order_amount: z.coerce.number().min(0).default(0),
  max_uses: z.coerce.number().int().min(1, "Must allow at least 1 use"),
  expires_at: z.string().min(1, "Expiry date is required"),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface CouponFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AdminCoupon | null;
}

export function CouponFormDialog({ open, onOpenChange, initialData }: CouponFormDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [productSearch, setProductSearch] = useState("");
  const [productOpen, setProductOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(productSearch), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [productSearch]);

  const { data: productsData } = useQuery({
    queryKey: ["admin", "products", "list", { search: debouncedSearch, limit: 10 }],
    queryFn: () => getProducts({ search: debouncedSearch || undefined, limit: 10 }),
    enabled: productOpen,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      discount_type: "percentage",
      discount_value: 0,
      product_id: null,
      min_order_amount: 0,
      max_uses: 100,
      expires_at: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          code: initialData.code,
          discount_type: initialData.discount_type,
          discount_value: initialData.discount_value,
          product_id: initialData.product_id,
          min_order_amount: initialData.min_order_amount,
          max_uses: initialData.max_uses,
          expires_at: initialData.expires_at?.split("T")[0],
          is_active: initialData.is_active,
        });
      } else {
        form.reset({
          code: "",
          discount_type: "percentage",
          discount_value: 0,
          product_id: null,
          min_order_amount: 0,
          max_uses: 100,
          expires_at: "",
          is_active: true,
        });
      }
    }
  }, [open, initialData, form]);

  const selectedProduct = productsData?.data.find(
    (p) => p.id === form.watch("product_id"),
  );

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      createAdminCoupon({
        code: data.code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        product_id: data.product_id || null,
        min_order_amount: data.min_order_amount,
        max_uses: data.max_uses,
        expires_at: data.expires_at,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCouponZoneKeys.coupons() });
      onOpenChange(false);
      toast.success(t("Coupon created"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to create coupon"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!initialData) throw new Error("No coupon to update");
      return updateAdminCoupon(initialData.id, {
        code: data.code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        product_id: data.product_id || null,
        min_order_amount: data.min_order_amount,
        max_uses: data.max_uses,
        expires_at: data.expires_at,
        is_active: data.is_active,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCouponZoneKeys.coupons() });
      onOpenChange(false);
      toast.success(t("Coupon updated"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to update coupon"));
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
          <DialogTitle>{initialData ? t("Edit Coupon") : t("Add Coupon")}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="code"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Code *")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("e.g. SAVE20")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="product_id"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Product")}</FormLabel>
                <Popover open={productOpen} onOpenChange={setProductOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {selectedProduct
                          ? selectedProduct.name
                          : field.value === null
                            ? t("All Products")
                            : t("Search products...")}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput
                        placeholder={t("Search products...")}
                        value={productSearch}
                        onValueChange={setProductSearch}
                      />
                      <CommandList>
                        <CommandEmpty>{t("No products found.")}</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="__all__"
                            onSelect={() => {
                              field.onChange(null);
                              setProductOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 size-4",
                                field.value === null ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {t("All Products")}
                          </CommandItem>
                          {productsData?.data.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.id}
                              onSelect={() => {
                                field.onChange(product.id);
                                setProductOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 size-4",
                                  field.value === product.id ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {product.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="discount_type"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Type *")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select type")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="percentage">{t("Percentage (%)")}</SelectItem>
                      <SelectItem value="fixed">{t("Fixed ($)")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="discount_value"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Value *")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={form.watch("discount_type") === "percentage" ? "20" : "10"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            name="min_order_amount"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Min Order Amount")}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="max_uses"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Max Uses *")}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="expires_at"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Expiry Date *")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
