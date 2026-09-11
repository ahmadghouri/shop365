import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NotifType = 'order' | 'promo' | 'delivery' | 'review' | 'general';

export type Notification = {
    id: string;
    type: NotifType;
    title: string;
    body: string;
    time: string;
    read: boolean;
    reference_id?: string;
    reference_type?: string;
    metadata?: { business_type?: string; business_name?: string };
};

type NotificationStore = {
    notifications: Notification[];
    unreadCount: () => number;
    markRead: (id: string) => void;
    markAllRead: () => void;
    setNotifications: (list: Notification[]) => void;
    appendNotifications: (list: Notification[]) => void;
    addNotification: (n: Omit<Notification, 'id' | 'time' | 'read'> & Partial<Pick<Notification, 'id' | 'time' | 'read' | 'reference_id' | 'reference_type'>>) => void;
};

export const useNotificationStore = create<NotificationStore>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: () => get().notifications.filter((n) => !n.read).length,
            markRead: (id) =>
                set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
            markAllRead: () =>
                set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
            setNotifications: (list) =>
                set((s) => ({
                    notifications: list.length > 0
                        ? [...list, ...s.notifications.filter((n) => !list.some((m) => m.id === n.id))]
                        : s.notifications,
                })),
            appendNotifications: (list) =>
                set((s) => ({
                    notifications: [...s.notifications.filter((n) => !list.some((m) => m.id === n.id)), ...list],
                })),
            addNotification: (incoming) =>
                set((s) => {
                    const id = incoming.id ?? '';
                    if (id && s.notifications.some((n) => n.id === id)) return s;
                    return {
                        notifications: [
                            {
                                id: id || Date.now().toString(),
                                time: incoming.time ?? 'Just now',
                                read: incoming.read ?? false,
                                type: incoming.type as NotifType,
                                title: incoming.title,
                                body: incoming.body,
                                reference_id: incoming.reference_id,
                                reference_type: incoming.reference_type,
                            },
                            ...s.notifications,
                        ],
                    };
                }),
        }),
        {
            name: 'notification-storage',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
