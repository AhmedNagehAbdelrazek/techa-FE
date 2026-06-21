import { request } from "./Request";
import type { NotificationsListResponse, NotificationsQueryParams } from "@/lib/types/notification";

export async function getNotifications(params?: NotificationsQueryParams): Promise<NotificationsListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  const endpoint = qs ? `/api/notifications?${qs}` : "/api/notifications";
  return request.get<NotificationsListResponse>(endpoint);
}

export async function markAsRead(id: string): Promise<void> {
  return request.patch<void>(`/api/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  return request.patch<void>("/api/notifications/read-all");
}
