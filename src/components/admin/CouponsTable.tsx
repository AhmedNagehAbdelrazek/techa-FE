"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import {
  getAdminCoupons,
  deactivateAdminCoupon,
  adminCouponZoneKeys,
  type AdminCoupon,
} from "@/lib/api/admin-coupons-zones";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CouponsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-none" />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}

interface CouponsTableProps {
  page: number;
  onEdit: (coupon: AdminCoupon) => void;
}

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export function CouponsTable({ page, onEdit }: CouponsTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canUpdate = permissions["coupons"]?.includes("update") ?? false;
  const canDelete = permissions["coupons"]?.includes("delete") ?? false;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminCouponZoneKeys.coupons(),
    queryFn: () => getAdminCoupons({ page, limit: 20 }),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCouponZoneKeys.coupons() });
      toast.success("Coupon deactivated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate coupon");
    },
  });

  if (isLoading) return <CouponsTableSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={refetch} />;
  if (!data?.data.length) return <EmptyState title="No coupons found." />;

  const { data: coupons, meta } = data;
  const startRow = (meta.page - 1) * meta.limit + 1;
  const endRow = Math.min(meta.page * meta.limit, meta.total);

  function badgeVariant(coupon: AdminCoupon): "secondary" | "destructive" | "default" {
    if (!coupon.is_active) return "secondary";
    if (new Date(coupon.expires_at) < new Date()) return "destructive";
    return "default";
  }

  function badgeLabel(coupon: AdminCoupon): string {
    if (!coupon.is_active) return "Inactive";
    if (new Date(coupon.expires_at) < new Date()) return "Expired";
    return "Active";
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="w-20">Status</TableHead>
              {(canUpdate || canDelete) && <TableHead className="w-24">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono text-sm font-medium">{coupon.code}</TableCell>
                <TableCell className="text-muted-foreground">
                  {coupon.product?.name ?? "All Products"}
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {coupon.discount_type === "percentage" ? "%" : "$"}
                </TableCell>
                <TableCell>
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}%`
                    : `$${coupon.discount_value}`}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {coupon.used_count}/{coupon.max_uses}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(coupon.expires_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={badgeVariant(coupon)}>{badgeLabel(coupon)}</Badge>
                </TableCell>
                {(canUpdate || canDelete) && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {canUpdate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => onEdit(coupon)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      )}
                      {canDelete && coupon.is_active && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deactivate coupon?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will deactivate code &ldquo;{coupon.code}&rdquo;.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deactivateMutation.mutate(coupon.id)}
                              >
                                Deactivate
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startRow}–{endRow} of {meta.total}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("page", String(meta.page - 1));
              router.replace(`/admin/coupons?${params.toString()}`);
            }}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("page", String(meta.page + 1));
              router.replace(`/admin/coupons?${params.toString()}`);
            }}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
