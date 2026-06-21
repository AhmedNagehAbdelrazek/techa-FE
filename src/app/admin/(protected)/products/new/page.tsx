"use client";

import { useAdminStore } from "@/lib/stores/admin.store";
import { ProductForm } from "@/components/admin/ProductForm";

export default function AdminNewProductPage() {
  const permissions = useAdminStore((s) => s.admin?.permissions ?? {});
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
