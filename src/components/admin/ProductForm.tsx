"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import type { FieldErrors } from "react-hook-form";

import {
  createProduct,
  updateProduct,
  adminProductsKeys,
  type CreateProductPayload,
  type UpdateProductPayload,
  type AdminProduct,
} from "@/lib/api/admin-products";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProductFormBasicInfo } from "./ProductFormBasicInfo";
import { ProductFormAttributes } from "./ProductFormAttributes";
import { ProductFormImages } from "./ProductFormImages";
import { ProductFormTags } from "./ProductFormTags";
import { ProductFormVariants } from "./ProductFormVariants";

const variantSchema = z.object({
  id: z.string().optional(),
  version: z.number().optional(),
  options: z.array(
    z.object({ option_name: z.string(), option_value: z.string() }),
  ),
  sku: z.string().optional(),
  price: z.number().min(0),
  discount_percent: z.number().min(0).max(100).optional(),
  stock_qty: z.number().min(0),
  is_active: z.boolean().optional(),
  _destroy: z.boolean().optional(),
});

const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  category_id: z.string().nullable().optional(),
  brand_id: z.string().nullable().optional(),
  description: z.string().optional(),
  about_points: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  details_attributes: z.array(
    z.object({ label: z.string(), value: z.string() }),
  ).optional(),
  specs_attributes: z.array(
    z.object({ label: z.string(), value: z.string() }),
  ).optional(),
  images: z.array(
    z.object({
      url: z.string(),
      alt_text: z.string(),
      is_primary: z.boolean(),
      sort_order: z.number(),
    }),
  ).optional(),
  tags: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const fieldTabMap: Record<string, string> = {
  name: "basic-info",
  slug: "basic-info",
  category_id: "basic-info",
  brand_id: "basic-info",
  description: "basic-info",
  is_featured: "basic-info",
  is_active: "basic-info",
  about_points: "attributes",
  details_attributes: "attributes",
  specs_attributes: "attributes",
  images: "images",
  tags: "tags",
  variants: "variants",
};

interface ProductFormProps {
  product?: AdminProduct;
  mode: "create" | "edit";
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const defaultValues: ProductFormValues = {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    category_id: product?.category_id ?? product?.category?.id ?? null,
    brand_id: product?.brand_id ?? product?.brand?.id ?? null,
    description: product?.description ?? "",
    about_points: product?.about_points ?? [],
    is_featured: product?.is_featured ?? false,
    is_active: product?.is_active ?? true,
    details_attributes:
      product?.attributes?.details?.map((d) => ({
        label: d.label ?? "",
        value: d.value ?? "",
      })) ?? [],
    specs_attributes:
      product?.attributes?.specs?.map((s) => ({
        label: s.label ?? "",
        value: s.value ?? "",
      })) ?? [],
    images:
      product?.images?.map((img) => ({
        url: img.url,
        alt_text: img.alt_text ?? "",
        is_primary: img.is_primary ?? false,
        sort_order: img.sort_order,
      })) ?? [],
    tags: product?.tags?.map((t) => ({ id: t.id, name: t.name })) ?? [],
    variants:
      product?.variants?.map((v) => ({
        id: v.id,
        version: v.version,
        options: v.options.map((o) => ({
          option_name: o.option_name ?? "",
          option_value: o.option_value ?? "",
        })),
        sku: v.sku,
        price: v.price,
        discount_percent: v.discount_percent,
        stock_qty: v.stock_qty,
        is_active: v.is_active,
      })) ?? [
        {
          options: [{ option_name: "", option_value: "" }],
          sku: "",
          price: 0,
          discount_percent: 0,
          stock_qty: 0,
          is_active: true,
        },
      ],
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  const { formState } = form;

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (formState.isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [formState.isDirty]);

  const createMutation = useMutation({
    mutationFn: (data: CreateProductPayload) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductsKeys.lists() });
      toast.success("Product created successfully");
      router.push("/admin/products");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: adminProductsKeys.detail(product!.id),
      });
      toast.success("Product updated successfully");
      router.push("/admin/products");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update product");
    },
  });

  const onSubmit = useCallback(
    (values: ProductFormValues) => {
      const attributes = {
        details: (values.details_attributes ?? []).filter((a) => a.label && a.value),
        specs: (values.specs_attributes ?? []).filter((a) => a.label && a.value),
      };

      const tag_ids = values.tags?.map((t) => t.id) ?? [];

      const images =
        values.images?.map((img, i) => ({
          url: img.url,
          alt_text: img.alt_text,
          is_primary: img.is_primary,
          sort_order: i,
        })) ?? [];

      const payload: CreateProductPayload = {
        name: values.name,
        slug: values.slug || undefined,
        category_id: values.category_id ?? null,
        brand_id: values.brand_id ?? null,
        description: values.description || undefined,
        about_points: values.about_points?.filter(Boolean) || undefined,
        is_featured: values.is_featured ?? false,
        attributes,
        tag_ids,
        images,
        variants:
          values.variants
            ?.filter((v) => !v._destroy)
            .map((v) => ({
              sku: v.sku || undefined,
              price: v.price,
              discount_percent: v.discount_percent || undefined,
              stock_qty: v.stock_qty,
              options: v.options.filter(
                (o) => o.option_name && o.option_value,
              ),
            })) || undefined,
      };

      if (mode === "create") {
        createMutation.mutate(payload);
      } else if (product) {
        const updatePayload: UpdateProductPayload = {
          ...payload,
          version: product.version,
          variants:
            values.variants
              ?.map((v) => {
                if (v.id) {
                  return {
                    id: v.id,
                    version: v.version,
                    sku: v.sku || undefined,
                    price: v.price,
                    discount_percent: v.discount_percent || undefined,
                    stock_qty: v.stock_qty,
                    is_active: v.is_active ?? true,
                    options: v.options.filter(
                      (o) => o.option_name && o.option_value,
                    ),
                    _destroy: v._destroy,
                  };
                }
                return {
                  sku: v.sku || undefined,
                  price: v.price,
                  discount_percent: v.discount_percent || undefined,
                  stock_qty: v.stock_qty,
                  is_active: v.is_active ?? true,
                  options: v.options.filter(
                    (o) => o.option_name && o.option_value,
                  ),
                };
              }) || undefined,
        };
        updateMutation.mutate({ id: product.id, data: updatePayload });
      }
    },
    [mode, product, createMutation, updateMutation],
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  const [activeTab, setActiveTab] = useState("basic-info");

  const onInvalid = useCallback((errors: FieldErrors<ProductFormValues>) => {
    const first = Object.entries(errors)[0];
    if (first) {
      const [fieldName] = first;
      const tab = fieldTabMap[fieldName] ?? "basic-info";
      setActiveTab(tab);
      const fieldError = first[1];
      const msg = (fieldError as { message?: string })?.message ?? "Please fix the form errors";
      toast.error(msg);
    }
    console.error(errors);
  }, []);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
          </TabsList>

          <TabsContent value="basic-info">
            <ProductFormBasicInfo />
          </TabsContent>

          <TabsContent value="attributes">
            <ProductFormAttributes />
          </TabsContent>

          <TabsContent value="images">
            <ProductFormImages />
          </TabsContent>

          <TabsContent value="tags">
            <ProductFormTags />
          </TabsContent>

          <TabsContent value="variants">
            <ProductFormVariants />
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex items-center justify-end gap-4 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving..."
              : mode === "create"
                ? "Create Product"
                : "Update Product"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
