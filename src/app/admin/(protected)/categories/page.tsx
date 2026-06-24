"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";

import { CategoryTree } from "@/components/admin/CategoryTree";
import { CategoryFormDialog } from "@/components/admin/CategoryFormDialog";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Button } from "@/components/ui/button";
import type { AdminCategory } from "@/lib/api/admin-taxonomy";

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  useEffect(() => { document.title = "إدارة التصنيفات — TechA"; }, []);
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canCreate = permissions["categories"]?.includes("create") ?? false;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  function handleAdd() {
    setEditingCategory(null);
    setParentId(null);
    setDialogOpen(true);
  }

  function handleAddSubcategory(id: string) {
    setEditingCategory(null);
    setParentId(id);
    setDialogOpen(true);
  }

  function handleEdit(category: AdminCategory) {
    setEditingCategory(category);
    setParentId(null);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("Categories")}</h1>
        {canCreate && (
          <Button onClick={handleAdd}>
            <Plus className="size-4" />
            {t("Add Category")}
          </Button>
        )}
      </div>
      <CategoryTree onEdit={handleEdit} onAddSubcategory={handleAddSubcategory} />
      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingCategory}
        parentId={parentId}
      />
    </div>
  );
}
