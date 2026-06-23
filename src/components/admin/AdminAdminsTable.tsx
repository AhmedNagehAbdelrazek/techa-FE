"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, ShieldOff, Shield } from "lucide-react";

import { getAdmins, deactivateAdmin, updateAdmin, adminAdminsRolesKeys, type AdminAccount } from "@/lib/api/admin-admins-roles";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function AdminAdminsTableSkeleton() {
  return (
    <div className="rounded-md border">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-none" />
      ))}
    </div>
  );
}

interface Props {
  onEdit: (admin: AdminAccount) => void;
}

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export function AdminAdminsTable({ onEdit }: Props) {
  const queryClient = useQueryClient();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const currentAdmin = useAdminStore((s) => s.admin);
  const canUpdate = permissions["admins"]?.includes("update") ?? false;
  const canDelete = permissions["admins"]?.includes("delete") ?? false;

  const { data: admins, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminAdminsRolesKeys.admins(),
    queryFn: getAdmins,
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAdminsRolesKeys.admins() });
      toast.success("Admin deactivated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate admin");
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => updateAdmin(id, { is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAdminsRolesKeys.admins() });
      toast.success("Admin reactivated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to reactivate admin");
    },
  });

  if (isLoading) return <AdminAdminsTableSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={refetch} />;
  if (!admins?.length) return <EmptyState title="No admins found." />;

  function roleLabel(admin: AdminAccount) {
    // ponytail: backend returns role as string in list, object in create/update
    return typeof admin.role === "string" ? admin.role : admin.role?.name ?? "-";
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-20">Status</TableHead>
            <TableHead className="w-28">Created</TableHead>
            {(canUpdate || canDelete) && <TableHead className="w-24">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell className="font-medium">{admin.name}</TableCell>
              <TableCell className="text-muted-foreground">{admin.email}</TableCell>
              <TableCell className="capitalize text-muted-foreground">{roleLabel(admin)}</TableCell>
              <TableCell>
                <Badge variant={admin.is_active ? "default" : "secondary"}>
                  {admin.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(admin.created_at).toLocaleDateString()}
              </TableCell>
              {(canUpdate || canDelete) && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    {canUpdate && (
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => onEdit(admin)}>
                        <Pencil className="size-3.5" />
                      </Button>
                    )}
                    {canDelete && admin.is_active && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive">
                            <ShieldOff className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deactivate admin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {currentAdmin?.id === admin.id
                                ? "You are deactivating your own account. This cannot be undone."
                                : `"${admin.name}" will no longer be able to log in.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deactivateMutation.mutate(admin.id)}>
                              Deactivate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {canUpdate && !admin.is_active && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7">
                            <Shield className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reactivate admin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will reactivate &ldquo;{admin.name}&rdquo;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => reactivateMutation.mutate(admin.id)}>
                              Reactivate
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
