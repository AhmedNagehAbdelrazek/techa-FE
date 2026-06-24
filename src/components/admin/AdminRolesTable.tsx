"use client";

import { useTranslation } from "@/lib/i18n/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import { getRoles, deactivateRole, adminAdminsRolesKeys, type AdminRole } from "@/lib/api/admin-admins-roles";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function AdminRolesTableSkeleton() {
  return (
    <div className="rounded-md border">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-none" />
      ))}
    </div>
  );
}

interface Props {
  onEdit: (role: AdminRole) => void;
}

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export function AdminRolesTable({ onEdit }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canUpdate = permissions["admins"]?.includes("update") ?? false;
  const canDelete = permissions["admins"]?.includes("delete") ?? false;

  const { data: roles, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminAdminsRolesKeys.roles(),
    queryFn: getRoles,
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAdminsRolesKeys.roles() });
      toast.success(t("Role deactivated"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to deactivate role"));
    },
  });

  if (isLoading) return <AdminRolesTableSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={refetch} />;
  if (!roles?.length) return <EmptyState title={t("No roles found.")} />;

  function permissionCount(role: AdminRole) {
    //   count total actions across all resource keys
    return Object.values(role.permissions).reduce((sum, actions) => sum + actions.length, 0);
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("Name")}</TableHead>
            <TableHead>{t("Permissions")}</TableHead>
            {(canUpdate || canDelete) && <TableHead className="w-24">{t("Actions")}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell className="text-muted-foreground">{permissionCount(role)}</TableCell>
              {(canUpdate || canDelete) && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    {canUpdate && (
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => onEdit(role)}>
                        <Pencil className="size-3.5" />
                      </Button>
                    )}
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive">
                            <Trash2 className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("Deactivate role?")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("This will deactivate role {{name}}.", { name: role.name })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deactivateMutation.mutate(role.id)}>
                              {t("Deactivate")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
