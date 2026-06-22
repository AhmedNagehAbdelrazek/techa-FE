"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { toast } from "sonner";
import { approvePayment, rejectPayment, adminOrdersKeys } from "@/lib/api/admin-orders";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  failed: "Failed",
  refunded: "Refunded",
};

const PAYMENT_STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "default",
  failed: "destructive",
  refunded: "secondary",
};

interface PaymentInfoCardProps {
  payment: {
    id: string;
    payment_method: string;
    amount: number;
    status: string;
    proof_reference: string | null;
    proof_screenshot_url: string | null;
    created_at: string;
  };
  canUpdate: boolean;
  onApproved: () => void;
  onRejected: () => void;
}

export function PaymentInfoCard({ payment, canUpdate, onApproved, onRejected }: PaymentInfoCardProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [screenshotDialogOpen, setScreenshotDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: () => approvePayment(payment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all });
      toast.success("Payment approved");
      onApproved();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to approve payment");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectPayment(payment.id, rejectionNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all });
      toast.success("Payment rejected");
      setRejectDialogOpen(false);
      setRejectionNote("");
      onRejected();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to reject payment");
    },
  });

  const isPending = payment.status === "pending";

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-3 text-base font-semibold">Payment</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Method</span>
          <span className="font-medium">{payment.payment_method}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">{formatPrice(payment.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={PAYMENT_STATUS_VARIANTS[payment.status] ?? "outline"}>
            {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date</span>
          <span>{formatDateTime(payment.created_at)}</span>
        </div>
        {payment.proof_reference && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reference</span>
            <span className="font-mono text-xs">{payment.proof_reference}</span>
          </div>
        )}
        {payment.proof_screenshot_url && (
          <div className="pt-2">
            <Dialog open={screenshotDialogOpen} onOpenChange={setScreenshotDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  View Screenshot
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Payment Screenshot</DialogTitle>
                </DialogHeader>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={payment.proof_screenshot_url}
                    alt="Payment proof screenshot"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {isPending && canUpdate && (
        <div className="mt-4 flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="flex-1">
                Approve
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Approve payment?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will mark the payment as confirmed. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? "Approving..." : "Approve"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex-1">
                Reject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Payment</DialogTitle>
                <DialogDescription>
                  Provide a reason for rejecting this payment.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Rejection reason..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                rows={3}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => rejectMutation.mutate()}
                  disabled={!rejectionNote.trim() || rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
