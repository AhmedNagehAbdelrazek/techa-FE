"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { BannersTable } from "@/components/admin/BannersTable";
import { BannerFormDialog } from "@/components/admin/BannerFormDialog";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Button } from "@/components/ui/button";
import type { AdminBanner } from "@/lib/api/admin-banners-settings-media";

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export default function AdminBannersPage() {
  useEffect(() => { document.title = "إدارة البنرات — TechA"; }, []);
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canCreate = permissions["content"]?.includes("create") ?? false;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);

  function handleAdd() { setEditingBanner(null); setDialogOpen(true); }
  function handleEdit(banner: AdminBanner) { setEditingBanner(banner); setDialogOpen(true); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Banners</h1>
        {canCreate && (
          <Button onClick={handleAdd}>
            <Plus className="size-4" />
            Add Banner
          </Button>
        )}
      </div>
      <BannersTable onEdit={handleEdit} />
      <BannerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editingBanner} />
    </div>
  );
}
