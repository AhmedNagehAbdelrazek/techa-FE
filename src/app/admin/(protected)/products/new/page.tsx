"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/lib/stores/admin.store";
import { ProductForm } from "@/components/admin/ProductForm";

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export default function AdminNewProductPage() {
  useEffect(() => { document.title = "إضافة منتج — TechA"; }, []);
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canCreate = permissions["products"]?.includes("create") ?? false;

  if (!canCreate) {
    return (
      <div className="text-muted-foreground">
        You do not have permission to create products.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Product</h1>
      <ProductForm mode="create" />
    </div>
  );
}
