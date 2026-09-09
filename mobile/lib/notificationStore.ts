import { create } from 'zustand';

type NotifType = 'order' | 'promo' | 'delivery' | 'review' | 'general';

export type Notification = {
    id: string;
    type: NotifType;
    title: string;
    body: string;
    time: string;
    read: boolean;
};

const MOCK: Notification[] = [];

type NotificationStore = {
    notifications: Notification[];
    unreadCount: () => number;
    markRead: (id: string) => void;
    markAllRead: () => void;
    addNotification: (n: Omit<Notification, 'id' | 'time' | 'read'> & Partial<Pick<Notification, 'id' | 'time' | 'read'>>) => void;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: MOCK,
    unreadCount: () => get().notifications.filter((n) => !n.read).length,
    markRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
    markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
    addNotification: (incoming) =>
        set((s) => ({
            notifications: [
                {
                    id: incoming.id ?? Date.now().toString(),
                    time: incoming.time ?? 'Just now',
                    read: incoming.read ?? false,
                    type: incoming.type as NotifType,
                    title: incoming.title,
                    body: incoming.body,
                },
                ...s.notifications,
            ],
        })),
}));
