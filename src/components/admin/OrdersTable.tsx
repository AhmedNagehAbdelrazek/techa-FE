"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import {
  getOrders,
  adminOrdersKeys,
  type AdminOrderListParams,
} from "@/lib/api/admin-orders";
import { useAdminStore } from "@/lib/stores/admin.store";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "ghost"> = {
  pending: "outline",
  confirmed: "default",
  processing: "secondary",
  shipped: "ghost",
  delivered: "default",
  cancelled: "destructive",
};

const PAYMENT_STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "default",
  failed: "destructive",
  refunded: "secondary",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  failed: "Failed",
  refunded: "Refunded",
};

export function OrdersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>
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

interface OrdersTableProps {
  searchParams: {
    search?: string;
    status?: string;
    payment_status?: string;
    date_from?: string;
    date_to?: string;
    sort?: string;
    page?: string;
  };
}

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export function OrdersTable({ searchParams }: OrdersTableProps) {
  const router = useRouter();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canRead = permissions["orders"]?.includes("read") ?? false;

  const filters: AdminOrderListParams = {
    search: searchParams.search || "",
    status: searchParams.status || "",
    payment_status: searchParams.payment_status || "",
    date_from: searchParams.date_from || "",
    date_to: searchParams.date_to || "",
    sort: searchParams.sort || "",
    page: searchParams.page ? Number(searchParams.page) : 1,
    limit: 20,
  };

  const { data: listData, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminOrdersKeys.list(filters),
    queryFn: () => getOrders(filters),
    enabled: canRead,
  });

  const updateUrlParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(searchParams)) {
        if (v !== undefined) params.set(k, v);
      }
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `/admin/orders?${qs}` : "/admin/orders", { scroll: false });
    },
    [router, searchParams],
  );

  const updateUrlParamRef = useRef(updateUrlParam);
  updateUrlParamRef.current = updateUrlParam;

  const [searchInput, setSearchInput] = useState(searchParams.search || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateUrlParamRef.current("search", searchInput || undefined);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  const currentSort = searchParams.sort || "";
  const [sortField, sortDir] = currentSort ? currentSort.split(":") : ["", ""];

  const toggleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        const nextDir = sortDir === "asc" ? "desc" : "asc";
        updateUrlParam("sort", `${field}:${nextDir}`);
      } else {
        updateUrlParam("sort", `${field}:asc`);
      }
    },
    [sortField, sortDir, updateUrlParam],
  );

  const meta = listData?.meta;
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

  const clearFilters = useCallback(() => {
    router.replace("/admin/orders", { scroll: false });
    setSearchInput("");
  }, [router]);

  const hasActiveFilters = !!(searchParams.search || searchParams.status || searchParams.payment_status || searchParams.date_from || searchParams.date_to);

  if (!canRead) {
    return (
      <ErrorState
        title="Access Denied"
        message="You do not have permission to view orders."
      />
    );
  }

  if (isLoading) return <OrdersTableSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Failed to load orders"
        message={(error as Error)?.message}
        onRetry={() => refetch()}
      />
    );
  }

  const orders = listData?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order # or email..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select
          value={searchParams.status || "all"}
          onValueChange={(v) => updateUrlParam("status", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.payment_status || "all"}
          onValueChange={(v) => updateUrlParam("payment_status", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment</SelectItem>
            {PAYMENT_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          className="w-32"
          value={searchParams.date_from || ""}
          onChange={(e) => updateUrlParam("date_from", e.target.value || undefined)}
          placeholder="From"
        />

        <Input
          type="date"
          className="w-32"
          value={searchParams.date_to || ""}
          onChange={(e) => updateUrlParam("date_to", e.target.value || undefined)}
          placeholder="To"
        />
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No orders match your filters" : "No orders yet"}
          description={hasActiveFilters ? "Try adjusting your search or filters." : "Orders will appear here once customers place them."}
          action={hasActiveFilters ? <Button variant="outline" onClick={clearFilters}>Clear Filters</Button> : undefined}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="text-right">
                <TableHead className="text-right">
                  <SortHeader
                    label="Order"
                    field="order_number"
                    currentField={sortField}
                    currentDir={sortDir}
                    onToggle={toggleSort}
                  />
                </TableHead>
                <TableHead className="text-right">Customer</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">
                  <SortHeader
                    label="Total"
                    field="total"
                    currentField={sortField}
                    currentDir={sortDir}
                    onToggle={toggleSort}
                  />
                </TableHead>
                <TableHead className="text-right">
                  <SortHeader
                    label="Status"
                    field="status"
                    currentField={sortField}
                    currentDir={sortDir}
                    onToggle={toggleSort}
                  />
                </TableHead>
                <TableHead className="text-right">Payment</TableHead>
                <TableHead className="text-right">
                  <SortHeader
                    label="Date"
                    field="created_at"
                    currentField={sortField}
                    currentDir={sortDir}
                    onToggle={toggleSort}
                  />
                </TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex flex-col">
                      <span>{order.customer?.full_name ?? "—"}</span>
                      <span className="text-xs">{order.customer?.email ?? ""}</span>
                    </div>
                  </TableCell>
                  <TableCell>{order.item_count}</TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[order.status] ?? "outline"}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={PAYMENT_STATUS_VARIANTS[order.payment_status] ?? "outline"}>
                      {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDateTime(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/orders/${order.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({meta?.total ?? 0} orders)
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => updateUrlParam("page", String(currentPage - 1))}
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
                  onClick={() => updateUrlParam("page", String(p))}
                >
                  {p}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => updateUrlParam("page", String(currentPage + 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface SortHeaderProps {
  label: string;
  field: string;
  currentField: string;
  currentDir: string;
  onToggle: (field: string) => void;
}

function SortHeader({ label, field, currentField, currentDir, onToggle }: SortHeaderProps) {
  const isActive = currentField === field;
  const Icon = isActive ? (currentDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      onClick={() => onToggle(field)}
      className="inline-flex items-center gap-1 hover:text-foreground"
    >
      {label}
      <Icon className="size-3.5" />
    </button>
  );
}
