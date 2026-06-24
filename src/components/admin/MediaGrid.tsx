"use client";

import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";

import { getMedia, deleteMedia, adminBannerSettingsKeys } from "@/lib/api/admin-banners-settings-media";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MediaUploadZone } from "./MediaUploadZone";

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

//   no shadcn Pagination — manual page buttons
function PageNav({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Prev</Button>
      <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</Button>
    </div>
  );
}

//   inline grid skeleton
function MediaGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full rounded-lg" />
      ))}
    </div>
  );
}

export function MediaGrid() {
  const queryClient = useQueryClient();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canDelete = permissions["media"]?.includes("delete") ?? false;

  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...adminBannerSettingsKeys.media(), page],
    queryFn: () => getMedia({ page, limit }),
    placeholderData: (prev) => prev, //   keepPreviousData-equivalent
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBannerSettingsKeys.media() });
      toast.success("File deleted");
    },
    onError: (err: unknown) => {
      //   409 conflict check via message string
      const msg = err instanceof Error ? err.message : "Failed to delete";
      if (msg.includes("409") || msg.toLowerCase().includes("in use") || msg.toLowerCase().includes("conflict")) {
        toast.error("This file is in use by other content. Remove all references first.");
      } else {
        toast.error(msg);
      }
    },
  });

  if (isLoading) return <MediaGridSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={refetch} />;

  const files = data?.data ?? [];
  const meta = data?.meta;

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  }

  return (
    <div className="space-y-4">
      <MediaUploadZone />
      {!files.length ? (
        <EmptyState title="No media yet" description="Upload images to use across your store." />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {files.map((file) => (
              <div key={file.id} className="group relative overflow-hidden rounded-lg border">
                <img src={file.url} alt={file.filename} className="aspect-square w-full object-cover" /> {/*   plain img */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  {canDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="size-7 p-0">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete file?</AlertDialogTitle>
                          <AlertDialogDescription>This permanently removes &ldquo;{file.filename}&rdquo;.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(file.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <Button variant="secondary" size="sm" className="size-7 p-0" onClick={() => copyUrl(file.url)}>
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {meta && <PageNav page={meta.page} totalPages={meta.totalPages} onPage={setPage} />}
        </>
      )}
    </div>
  );
}
