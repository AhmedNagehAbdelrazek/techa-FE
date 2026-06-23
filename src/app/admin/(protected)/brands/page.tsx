"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { BrandsTable } from "@/components/admin/BrandsTable";
import { BrandFormDialog } from "@/components/admin/BrandFormDialog";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Button } from "@/components/ui/button";
import type { AdminBrand } from "@/lib/api/admin-taxonomy";

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export default function AdminBrandsPage() {
  useEffect(() => { document.title = "إدارة العلامات التجارية — TechA"; }, []);
  return (
    <Suspense fallback={<BrandsPageSkeleton />}>
      <AdminBrandsPageContent />
    </Suspense>
  );
}

function BrandsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        <div className="h-9 w-28 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

function AdminBrandsPageContent() {
  const searchParams = useSearchParams();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canCreate = permissions["brands"]?.includes("create") ?? false;

  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<AdminBrand | null>(null);

  function handleAdd() {
    setEditingBrand(null);
    setDialogOpen(true);
  }

  function handleEdit(brand: AdminBrand) {
    setEditingBrand(brand);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brands</h1>
        {canCreate && (
          <Button onClick={handleAdd}>
            <Plus className="size-4" />
            Add Brand
          </Button>
        )}
      </div>
      <BrandsTable page={page} search={search} onEdit={handleEdit} />
      <BrandFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingBrand}
      />
    </div>
  );
}
