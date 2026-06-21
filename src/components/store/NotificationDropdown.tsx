"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { getNotifications, markAsRead } from "@/lib/api/notifications";
import type { Notification } from "@/lib/types/notification";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

interface NotificationDropdownProps {
  onClose: () => void;
  onMarkRead: () => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function NotificationDropdown({ onClose, onMarkRead }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getNotifications({ page: 1, limit: 5 });
      setNotifications(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      if (!notification.is_read) {
        try {
          await markAsRead(notification.id);
          onMarkRead();
        } catch {
          // silent
        }
      }
      onClose();
      if (notification.link) {
        window.location.href = notification.link;
      }
    },
    [onClose, onMarkRead],
  );

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className="absolute top-full left-1/2 mt-2 w-80 -translate-x-1/2 rounded-lg border bg-card shadow-lg"
    >
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Notifications</h3>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading && (
          <div className="p-4">
            <LoadingState />
          </div>
        )}
        {error && (
          <div className="p-4">
            <ErrorState />
          </div>
        )}
        {!loading && !error && notifications.length === 0 && (
          <p className="p-4 text-center text-sm text-muted-foreground">No notifications yet.</p>
        )}
        {!loading && !error && notifications.length > 0 && (
          <ul className="divide-y" role="listbox">
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => handleNotificationClick(n)}
                  className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-accent ${
                    !n.is_read ? "bg-accent/50" : ""
                  }`}
                  role="option"
                  aria-selected={false}
                >
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${
                      n.is_read ? "bg-transparent" : "bg-primary"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.message}</p>
                    <time dateTime={n.createdat} className="mt-0.5 text-xs text-muted-foreground">{timeAgo(n.createdat)}</time>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t px-4 py-2.5">
        <Link
          href="/notifications"
          onClick={onClose}
          className="block text-center text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>
    </div>
  );
}
