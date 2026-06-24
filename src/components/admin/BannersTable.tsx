"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import { getBanners, deleteBanner, adminBannerSettingsKeys, type AdminBanner } from "@/lib/api/admin-banners-settings-media";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

interface BannersTableProps {
  onEdit: (banner: AdminBanner) => void;
}

export function BannersTableSkeleton() {
  return (
    <div className="rounded-md border">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-none" />
      ))}
    </div>
  );
}

function badgeConfig(banner: AdminBanner): { variant: "secondary" | "destructive" | "default"; label: string } {
  if (!banner.is_active) return { variant: "secondary", label: "Inactive" };
  if (banner.ends_at && new Date(banner.ends_at) < new Date()) return { variant: "destructive", label: "Expired" };
  return { variant: "default", label: "Active" };
}

//   No separate BannerRow component — inline rows keep it simple
export function BannersTable({ onEdit }: BannersTableProps) {
  const queryClient = useQueryClient();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canUpdate = permissions["content"]?.includes("update") ?? false;
  const canDelete = permissions["content"]?.includes("delete") ?? false;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminBannerSettingsKeys.banners(),
    queryFn: getBanners,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBannerSettingsKeys.banners() });
      toast.success("Banner deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete banner");
    },
  });

  if (isLoading) return <BannersTableSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={refetch} />;
  if (!data?.data.length) return <EmptyState title="No banners yet" description="Create your first banner to promote products." />;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Period</TableHead>
            <TableHead className="w-16 text-center">Order</TableHead>
            <TableHead className="w-20">Status</TableHead>
            {(canUpdate || canDelete) && <TableHead className="w-24">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((banner) => {
            const { variant, label } = badgeConfig(banner);
            return (
              <TableRow key={banner.id}>
                <TableCell>
                  <img src={banner.image_url} alt={banner.title} className="h-10 w-20 rounded object-cover" /> {/*   plain img, no Next/Image for external URLs */}
                </TableCell>
                <TableCell className="font-medium">{banner.title}</TableCell>
                <TableCell className="capitalize text-muted-foreground">{banner.position}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(banner.starts_at).toLocaleDateString()}
                  {banner.ends_at ? ` – ${new Date(banner.ends_at).toLocaleDateString()}` : " – ∞"}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">{banner.sort_order}</TableCell>
                <TableCell>
                  <Badge variant={variant}>{label}</Badge>
                </TableCell>
                {(canUpdate || canDelete) && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {canUpdate && (
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => onEdit(banner)}>
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
                              <AlertDialogTitle>Delete banner?</AlertDialogTitle>
                              <AlertDialogDescription>This permanently removes &ldquo;{banner.title}&rdquo;.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(banner.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
