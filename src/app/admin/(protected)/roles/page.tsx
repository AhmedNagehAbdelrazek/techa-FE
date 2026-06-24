"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";

import { AdminRolesTable } from "@/components/admin/AdminRolesTable";
import { RoleFormDialog } from "@/components/admin/RoleFormDialog";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Button } from "@/components/ui/button";
import type { AdminRole } from "@/lib/api/admin-admins-roles";

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export default function AdminRolesPage() {
  useEffect(() => { document.title = "إدارة الصلاحيات — TechA"; }, []);
  const { t } = useTranslation();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canCreate = permissions["admins"]?.includes("create") ?? false;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);

  function handleAdd() {
    setEditingRole(null);
    setDialogOpen(true);
  }

  function handleEdit(role: AdminRole) {
    setEditingRole(role);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("Roles")}</h1>
        {canCreate && (
          <Button onClick={handleAdd}>
            <Plus className="size-4" />
            {t("Add Role")}
          </Button>
        )}
      </div>
      <AdminRolesTable onEdit={handleEdit} />
      <RoleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingRole}
      />
    </div>
  );
}
