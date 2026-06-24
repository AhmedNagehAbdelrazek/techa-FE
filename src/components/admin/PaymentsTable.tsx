"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/client";

import {
  getPendingPayments,
  approvePayment,
  rejectPayment,
  adminOrdersKeys,
  type PendingPayment,
} from "@/lib/api/admin-orders";
import { useAdminStore } from "@/lib/stores/admin.store";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const PAYMENT_STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "default",
  failed: "destructive",
  refunded: "secondary",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  failed: "Failed",
  refunded: "Refunded",
};

export function PaymentsTableSkeleton() {
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

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export function PaymentsTable() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canUpdate = permissions["orders"]?.includes("update") ?? false;

  const [page, setPage] = useState(1);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingPayment, setRejectingPayment] = useState<PendingPayment | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...adminOrdersKeys.payments, { page }],
    queryFn: () => getPendingPayments(page, 20),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approvePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all });
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.payments });
      toast.success(t("Payment approved"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to approve payment"));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => rejectPayment(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all });
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.payments });
      toast.success(t("Payment rejected"));
      setRejectDialogOpen(false);
      setRejectingPayment(null);
      setRejectionNote("");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to reject payment"));
    },
  });

  const handleReject = useCallback(() => {
    if (!rejectingPayment || !rejectionNote.trim()) return;
    rejectMutation.mutate({ id: rejectingPayment.id, note: rejectionNote });
  }, [rejectingPayment, rejectionNote, rejectMutation]);

  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const currentPage = meta?.page ?? 1;

  const pageRange = useMemo(() => {
    const delta = 2;
    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  if (isLoading) return <PaymentsTableSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title={t("Failed to load payments")}
        message={(error as Error)?.message}
        onRetry={() => refetch()}
      />
    );
  }

  const payments = data?.data ?? [];

  if (payments.length === 0) {
    return (
      <EmptyState
        title={t("No pending payments")}
        description={t("All payments have been reviewed.")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="text-right">
              <TableHead className="text-right">{t("Order")}</TableHead>
              <TableHead className="text-right">{t("Customer")}</TableHead>
              <TableHead className="text-right">{t("Method")}</TableHead>
              <TableHead className="text-right">{t("Amount")}</TableHead>
              <TableHead className="text-right">{t("Status")}</TableHead>
              <TableHead className="text-right">{t("Date")}</TableHead>
              <TableHead className="text-right">{t("Screenshot")}</TableHead>
              {canUpdate && <TableHead className="w-40" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                canUpdate={canUpdate}
                onApprove={() => approveMutation.mutate(payment.id)}
                onReject={() => {
                  setRejectingPayment(payment);
                  setRejectionNote("");
                  setRejectDialogOpen(true);
                }}
                isApproving={approveMutation.isPending}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("Page {{current}} of {{total}}", { current: currentPage, total: totalPages })} ({meta?.total ?? 0} {t("payments")})
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
            {pageRange.map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} className="px-2 text-sm text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === currentPage ? "default" : "outline"}
                  size="icon-sm"
                  className="size-8"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Reject Payment")}</DialogTitle>
            <DialogDescription>
              {rejectingPayment
                ? t("Reject payment for order {{orderNumber}}", { orderNumber: rejectingPayment.Order.order_number })
                : ""}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={t("Rejection reason...")}
            value={rejectionNote}
            onChange={(e) => setRejectionNote(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionNote.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? t("Rejecting...") : t("Reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PaymentRowProps {
  payment: PendingPayment;
  canUpdate: boolean;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
}

function PaymentRow({ payment, canUpdate, onApprove, onReject, isApproving }: PaymentRowProps) {
  const { t } = useTranslation();
  const [screenshotOpen, setScreenshotOpen] = useState(false);

  return (
    <TableRow>
      <TableCell className="font-medium">{payment.Order.order_number}</TableCell>
      <TableCell className="text-muted-foreground">
        <div className="flex flex-col">
          <span>{payment.Order.User.name}</span>
          <span className="text-xs">{payment.Order.User.email}</span>
        </div>
      </TableCell>
      <TableCell>{payment.payment_method}</TableCell>
      <TableCell>{formatPrice(payment.amount)}</TableCell>
      <TableCell>
        <Badge variant={PAYMENT_STATUS_VARIANTS[payment.status] ?? "outline"}>
          {t(PAYMENT_STATUS_LABELS[payment.status] ?? payment.status)}
        </Badge>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDateTime(payment.created_at)}
      </TableCell>
      <TableCell>
        {payment.proof_screenshot_url ? (
          <Dialog open={screenshotOpen} onOpenChange={setScreenshotOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                {t("View")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t("Payment Screenshot")}</DialogTitle>
              </DialogHeader>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={payment.proof_screenshot_url}
                  alt={t("Payment proof screenshot")}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      {canUpdate && (
        <TableCell>
          <div className="flex items-center gap-1">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" disabled={isApproving}>
                  {isApproving ? "..." : t("Approve")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("Approve payment?")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("This will mark the payment as confirmed for order {{orderNumber}}.", { orderNumber: payment.Order.order_number })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={onApprove}>
                    {t("Approve")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button size="sm" variant="outline" onClick={onReject}>
              {t("Reject")}
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}
