import apiClient from "@/api/client";
import type { Notification } from "@/lib/notificationStore";

export type BackendNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: { business_type?: string; business_name?: string };
};

function timeLabel(iso: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "Just now";
  if (ms < 3600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3600_000)}h ago`;
  return new Date(iso).toLocaleDateString("en-PK", {
    month: "short",
    day: "numeric",
  });
}

export function toLocalNotifications(
  list: BackendNotification[],
): Notification[] {
  return list.map((n) => ({
    id: n.id,
    type: n.type as Notification["type"],
    title: n.title,
    body: n.body,
    read: n.read,
    time: timeLabel(n.created_at),
    reference_id: n.reference_id,
    reference_type: n.reference_type,
    metadata: n.metadata,
  }));
}

export type NotificationsResponse = {
  data: BackendNotification[];
  total: number;
  hasMore: boolean;
};

export async function fetchNotifications(
  page = 1,
  limit = 20,
): Promise<NotificationsResponse> {
  const { data } = await apiClient.get("/notification", {
    params: { page, limit },
  });
  return {
    data: Array.isArray(data?.data) ? data.data : [],
    total: data?.meta?.total ?? 0,
    hasMore: data?.meta?.hasMore ?? false,
  };
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.put(`/notification/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.put("/notification/read-all");
}
