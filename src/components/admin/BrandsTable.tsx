"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/client";

import {
  getAdminBrands,
  deactivateAdminBrand,
  adminTaxonomyKeys,
  type AdminBrand,
} from "@/lib/api/admin-taxonomy";
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

export function BrandsTableSkeleton() {
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

interface BrandsTableProps {
  page: number;
  search: string;
  onEdit: (brand: AdminBrand) => void;
}

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export function BrandsTable({ page, search, onEdit }: BrandsTableProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canUpdate = permissions["brands"]?.includes("update") ?? false;
  const canDelete = permissions["brands"]?.includes("delete") ?? false;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminTaxonomyKeys.brands(),
    queryFn: () => getAdminBrands({ page, limit: 20, search }),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTaxonomyKeys.brands() });
      toast.success(t("Brand deactivated"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to deactivate brand"));
    },
  });

  if (isLoading) return <BrandsTableSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={refetch} />;
  if (!data?.data.length) return <EmptyState title={t("No brands found.")} />;

  const { data: brands, meta } = data;
  const startRow = (meta.page - 1) * meta.limit + 1;
  const endRow = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">{t("Logo")}</TableHead>
              <TableHead>{t("Name")}</TableHead>
              <TableHead>{t("Slug")}</TableHead>
              <TableHead>{t("Description")}</TableHead>
              <TableHead className="w-20">{t("Status")}</TableHead>
              {(canUpdate || canDelete) && <TableHead className="w-24">{t("Actions")}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={brand.name}
                      width={32}
                      height={32}
                      className="size-8 rounded object-contain"
                    />
                  ) : (
                    <div className="size-8 rounded bg-muted" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell className="text-muted-foreground">{brand.slug}</TableCell>
                <TableCell className="max-w-48 truncate text-muted-foreground">
                  {brand.description || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={brand.is_active ? "default" : "secondary"}>
                    {brand.is_active ? t("Active") : t("Inactive")}
                  </Badge>
                </TableCell>
                {(canUpdate || canDelete) && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {canUpdate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => onEdit(brand)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      )}
                      {canDelete && brand.is_active && (
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
                              <AlertDialogTitle>{t("Deactivate brand?")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("This will deactivate {{name}}. Related products may be affected.", { name: brand.name })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deactivateMutation.mutate(brand.id)}
                              >
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("Showing {{start}}–{{end}} of {{total}}", { start: startRow, end: endRow, total: meta.total })}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("page", String(meta.page - 1));
              router.replace(`/admin/brands?${params.toString()}`);
            }}
          >
            <ChevronLeft className="size-4" />
            {t("Previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("page", String(meta.page + 1));
              router.replace(`/admin/brands?${params.toString()}`);
            }}
          >
            {t("Next")}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
