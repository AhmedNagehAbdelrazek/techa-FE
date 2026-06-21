"use client";

import { useState, useCallback, useEffect } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "@/components/store/NotificationDropdown";
import { getNotifications } from "@/lib/api/notifications";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getNotifications({ page: 1, limit: 1 });
      setUnreadCount(res.meta.unread_count);
    } catch {
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleMarkRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  if (loading) return null;

  return (
    <>
    <span className="sr-only" role="status" aria-live="polite">
      {unreadCount > 0 ? `${unreadCount} unread notifications` : "No unread notifications"}
    </span>
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative rounded-md p-2 hover:bg-accent"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
        aria-expanded={open}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <Badge
            variant="secondary"
            className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full p-0 text-[10px]"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </button>
      {open && (
        <NotificationDropdown onClose={handleClose} onMarkRead={handleMarkRead} />
      )}
    </div>
    </>
  );
}
