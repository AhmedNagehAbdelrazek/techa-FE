"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getNotifications, markAllAsRead } from "@/lib/api/notifications";
import { NotificationList } from "@/components/store/NotificationList";
import { Pagination } from "@/components/store/Pagination";
import type { Notification, Meta } from "@/lib/types/notification";

export default function NotificationsPage() {
  useEffect(() => { document.title = "الإشعارات — TechA"; }, []);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getNotifications({ page, limit: 20 });
      setNotifications(res.data);
      setMeta(res.meta);
    } catch {
      setError(true);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      if (meta) setMeta({ ...meta, unread_count: 0 });
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  }, [meta]);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    if (meta && meta.unread_count > 0) setMeta({ ...meta, unread_count: meta.unread_count - 1 });
  }, [meta]);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )}
        </div>

        <div className="mt-6">
          <NotificationList
            notifications={notifications}
            loading={loading}
            error={error}
            onRetry={fetchNotifications}
            onMarkRead={handleMarkRead}
          />
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
