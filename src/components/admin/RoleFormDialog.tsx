"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { createRole, updateRole, adminAdminsRolesKeys, type AdminRole } from "@/lib/api/admin-admins-roles";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

//   hardcoded known resource keys — no need to fetch a schema
const RESOURCE_KEYS = ["products", "orders", "categories", "brands", "tags", "coupons", "zones", "content", "settings", "media", "admins"] as const;
const ACTIONS = ["read", "create", "update", "delete"] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AdminRole | null;
}

export function RoleFormDialog({ open, onOpenChange, initialData }: Props) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setPermissions(initialData?.permissions ?? {});
    }
  }, [open, initialData]);

  function togglePermission(resource: string, action: string) {
    setPermissions((prev) => {
      const current = prev[resource] ?? [];
      const has = current.includes(action);
      const next = has ? current.filter((a) => a !== action) : [...current, action];
      const result = { ...prev, [resource]: next };
      if (next.length === 0) delete result[resource];
      return result;
    });
  }

  const createMutation = useMutation({
    mutationFn: () => createRole({ name, permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAdminsRolesKeys.roles() });
      onOpenChange(false);
      toast.success("Role created");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create role");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!initialData) throw new Error("No role to update");
      return updateRole(initialData.id, { name, permissions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAdminsRolesKeys.roles() });
      onOpenChange(false);
      toast.success("Role updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (initialData) updateMutation.mutate();
    else createMutation.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Role" : "Create Role"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. content_manager" />
          </div>
          <div className="space-y-1">
            <Label>Permissions</Label>
            {/*   grouped checkboxes, no abstraction */}
            {RESOURCE_KEYS.map((resource) => {
              const checked = permissions[resource] ?? [];
              return (
                <div key={resource} className="rounded-md border p-3">
                  <p className="mb-2 text-sm font-medium capitalize">{resource}</p>
                  <div className="flex flex-wrap gap-4">
                    {ACTIONS.map((action) => (
                      <label key={action} className="flex items-center gap-1.5 text-sm">
                        <Checkbox
                          checked={checked.includes(action)}
                          onCheckedChange={() => togglePermission(resource, action)}
                        />
                        {action}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
