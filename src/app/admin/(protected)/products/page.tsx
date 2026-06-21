"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { ProductsTable, ProductsTableSkeleton } from "@/components/admin/ProductsTable";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Button } from "@/components/ui/button";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<ProductsListPageSkeleton />}>
        <ProductsPageContent />
      </Suspense>
    </div>
  );
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? {});
  const canCreate = permissions["products"]?.includes("create") ?? false;

  const params = {
    search: searchParams.get("search") ?? undefined,
    category_id: searchParams.get("category_id") ?? undefined,
    brand_id: searchParams.get("brand_id") ?? undefined,
    is_active: searchParams.get("is_active") ?? undefined,
    page: searchParams.get("page") ?? undefined,
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        {canCreate && (
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="size-4" />
              Add Product
            </Link>
          </Button>
        )}
      </div>
      <ProductsTable searchParams={params} />
    </>
  );
}

function ProductsListPageSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="h-9 w-32 bg-muted rounded animate-pulse" />
      </div>
      <ProductsTableSkeleton />
    </>
  );
}
