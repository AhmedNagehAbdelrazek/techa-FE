"use client";

import { useTranslation } from "@/lib/i18n/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  getAdminReviews,
  approveAdminReview,
  rejectAdminReview,
  deleteAdminReview,
  adminReviewKeys,
} from "@/lib/api/admin-reviews";
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

export function ReviewsTableSkeleton() {
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

interface ReviewsTableProps {
  page: number;
  status: string;
}

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export function ReviewsTable({ page, status }: ReviewsTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canApproveReject = permissions["reviews"]?.includes("update") ?? false;
  const canDelete = permissions["reviews"]?.includes("delete") ?? false;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminReviewKeys.list({ page, status }),
    queryFn: () => getAdminReviews({ page, limit: 20, status }),
  });

  const approveMutation = useMutation({
    mutationFn: approveAdminReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.all });
      toast.success(t("Review approved"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to approve review"));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectAdminReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.all });
      toast.success(t("Review rejected"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to reject review"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.all });
      toast.success(t("Review deleted"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to delete review"));
    },
  });

  if (isLoading) return <ReviewsTableSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={refetch} />;
  if (!data?.data.length) return <EmptyState title={t("No reviews found.")} />;

  const { data: reviews, meta } = data;
  const startRow = (meta.page - 1) * meta.limit + 1;
  const endRow = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Product")}</TableHead>
              <TableHead>{t("Customer")}</TableHead>
              <TableHead>{t("Rating")}</TableHead>
              <TableHead>{t("Comment")}</TableHead>
              <TableHead className="w-20">{t("Status")}</TableHead>
              <TableHead className="w-24">{t("Date")}</TableHead>
              {(canApproveReject || canDelete) && <TableHead className="w-28">{t("Actions")}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="max-w-32 truncate font-medium">
                  {review.product_id ?? "—"}
                </TableCell>
                <TableCell>{review.user?.name ?? review.reviewer_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{review.rating}/5</Badge>
                </TableCell>
                <TableCell className="max-w-48 truncate text-muted-foreground">
                  {review.comment || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={review.is_active ? "default" : "secondary"}>
                    {review.is_active ? t("Active") : t("Inactive")}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {review.createdat ? new Date(review.createdat).toLocaleDateString() : review.relative_date}
                </TableCell>
                {(canApproveReject || canDelete) && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {canApproveReject && !review.is_active && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-green-600 hover:text-green-600"
                          onClick={() => approveMutation.mutate(review.id)}
                          title={t("Approve")}
                        >
                          <Check className="size-3.5" />
                        </Button>
                      )}
                      {canApproveReject && review.is_active && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-amber-600 hover:text-amber-600"
                          onClick={() => rejectMutation.mutate(review.id)}
                          title={t("Reject")}
                        >
                          <X className="size-3.5" />
                        </Button>
                      )}
                      {canDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:text-destructive"
                              title={t("Delete")}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("Delete review?")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("This action cannot be undone.")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(review.id)}
                              >
                                {t("Delete")}
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
              router.replace(`/admin/reviews?${params.toString()}`);
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
              router.replace(`/admin/reviews?${params.toString()}`);
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
