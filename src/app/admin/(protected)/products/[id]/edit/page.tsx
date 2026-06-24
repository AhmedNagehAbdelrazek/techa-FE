"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n/client";

import { getProduct, adminProductsKeys } from "@/lib/api/admin-products";
import { useAdminStore } from "@/lib/stores/admin.store";
import { ProductForm } from "@/components/admin/ProductForm";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export default function AdminEditProductPage() {
  const { t } = useTranslation();
  const params = useParams();
  const id = params.id as string;
  useEffect(() => { document.title = `تعديل المنتج #${id} — TechA`; }, [id]);
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canUpdate = permissions["products"]?.includes("update") ?? false;

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminProductsKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: !!id && canUpdate,
  });

  if (!canUpdate) {
    return (
      <div className="text-muted-foreground">
        {t("You do not have permission to edit products.")}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full rounded-md" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title={t("Failed to load product")}
        message={(error as Error)?.message}
        onRetry={() => refetch()}
      />
    );
  }

  if (!product) {
    return (
      <div className="text-muted-foreground">{t("Product not found.")}</div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("Edit")}: {product.name}</h1>
      <ProductForm product={product} mode="edit" />
    </div>
  );
}
