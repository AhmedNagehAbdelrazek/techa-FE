export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unread_count: number;
}

export interface NotificationsQueryParams {
  page?: number;
  limit?: number;
}

export interface NotificationsListResponse {
  data: Notification[];
  meta: Meta;
}
