"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/client";
import { getOrders } from "@/lib/api/orders";
import { OrderCard } from "@/components/store/OrderCard";
import { OrderStatusTabs } from "@/components/store/OrderStatusTabs";
import { Pagination } from "@/components/store/Pagination";
import type { OrderListItem, Meta } from "@/lib/types/order";

export default function OrdersPage() {
  const { t } = useTranslation();
  useEffect(() => { document.title = "طلباتي — TechA"; }, []);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getOrders({
        status: statusFilter || undefined,
        page,
        limit: 20,
      });
      setOrders(res.data);
      setMeta(res.meta);
    } catch {
      setError(true);
      toast.error(t("Failed to load orders"));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  function handleTabChange(status: string) {
    setStatusFilter(status);
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">{t("My Orders")}</h1>

        <div className="mt-4">
          <OrderStatusTabs active={statusFilter} onTabChange={handleTabChange} />
        </div>

        {loading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : error ? (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">{t("Failed to load orders")}</p>
            <Button className="mt-4" onClick={fetchOrders}>
              {t("Retry")}
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              {statusFilter ? t("No {{status}} orders", { status: statusFilter }) : t("No orders yet")}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {meta && (
              <div className="mt-8">
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
