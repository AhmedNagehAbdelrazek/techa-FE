"use client";

import { useCallback } from "react";
import { markAsRead } from "@/lib/api/notifications";
import { useTranslation } from "@/lib/i18n/client";
import type { Notification } from "@/lib/types/notification";

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onMarkRead: (id: string) => void;
}

function timeAgo(dateStr: string, t: (key: string) => string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return t("just now");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}${t("m ago")}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t("h ago")}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}${t("d ago")}`;
  const months = Math.floor(days / 30);
  return `${months}${t("mo ago")}`;
}

export function NotificationList({ notifications, loading, error, onRetry, onMarkRead }: NotificationListProps) {
  const { t } = useTranslation();
  const handleClick = useCallback(
    async (n: Notification) => {
      if (!n.is_read) {
        try {
          await markAsRead(n.id);
          onMarkRead(n.id);
        } catch {
          // silent
        }
      }
      if (n.link) {
        window.location.href = n.link;
      }
    },
    [onMarkRead],
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("Failed to load notifications")}</p>
        <button
          onClick={onRetry}
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          {t("Retry")}
        </button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("You have no notifications yet.")}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y" role="list">
      {notifications.map((n) => (
        <li key={n.id}>
          <button
            onClick={() => handleClick(n)}
            className={`flex w-full gap-3 px-4 py-4 text-left hover:bg-accent ${
              !n.is_read ? "bg-accent/50" : ""
            }`}
          >
            <span
              className={`mt-1.5 size-2 shrink-0 rounded-full ${
                n.is_read ? "bg-transparent" : "bg-primary"
              }`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
              <time dateTime={n.createdat} className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdat, t)}</time>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
