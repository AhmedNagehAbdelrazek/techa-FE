"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { AdminAdminsTable } from "@/components/admin/AdminAdminsTable";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Button } from "@/components/ui/button";
import type { AdminAccount } from "@/lib/api/admin-admins-roles";

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export default function AdminAdminsPage() {
  useEffect(() => { document.title = "إدارة الأدمن — TechA"; }, []);
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canCreate = permissions["admins"]?.includes("create") ?? false;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);

  function handleAdd() {
    setEditingAdmin(null);
    setDialogOpen(true);
  }

  function handleEdit(admin: AdminAccount) {
    setEditingAdmin(admin);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admins</h1>
        {canCreate && (
          <Button onClick={handleAdd}>
            <Plus className="size-4" />
            Add Admin
          </Button>
        )}
      </div>
      <AdminAdminsTable onEdit={handleEdit} />
      <AdminFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingAdmin}
      />
    </div>
  );
}
