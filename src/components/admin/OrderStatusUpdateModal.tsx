"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateOrderStatus, adminOrdersKeys } from "@/lib/api/admin-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed"],
  confirmed: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

interface OrderStatusUpdateModalProps {
  orderId: string;
  currentStatus: string;
  onUpdated: () => void;
}

export function OrderStatusUpdateModal({ orderId, currentStatus, onUpdated }: OrderStatusUpdateModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const queryClient = useQueryClient();

  const availableTransitions = STATUS_TRANSITIONS[currentStatus] ?? [];

  const mutation = useMutation({
    mutationFn: (status: string) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.lists() });
      toast.success("Order status updated");
      setOpen(false);
      onUpdated();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    },
  });

  if (availableTransitions.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Update Status</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Current status:{" "}
            <Badge variant="outline">{STATUS_LABELS[currentStatus] ?? currentStatus}</Badge>
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          className="gap-3"
        >
          {availableTransitions.map((status) => (
            <div key={status} className="flex items-center gap-3 rounded-lg border p-3">
              <RadioGroupItem value={status} id={status} />
              <Label htmlFor={status} className="flex-1 cursor-pointer font-medium">
                {STATUS_LABELS[status] ?? status}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate(selectedStatus)}
            disabled={!selectedStatus || mutation.isPending}
          >
            {mutation.isPending ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
