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

const MOCK: Notification[] = [
    { id: '1', type: 'order',    read: false, title: 'Order Confirmed!',       body: 'Your order #ORD-2847 has been confirmed and is being prepared.',        time: '2 min ago' },
    { id: '2', type: 'delivery', read: false, title: 'Out for Delivery',       body: 'Your order #ORD-2831 is on its way. Expected in 30 minutes.',            time: '1 hr ago' },
    { id: '3', type: 'promo',    read: false, title: '10% Off This Weekend 🎉', body: 'Use code SHOP10 on your next order and save big on groceries.',          time: '3 hrs ago' },
    { id: '4', type: 'order',    read: true,  title: 'Order Delivered',        body: 'Your order #ORD-2820 was delivered successfully. Enjoy!',                 time: 'Yesterday' },
    { id: '5', type: 'review',   read: true,  title: 'Rate Your Experience',   body: 'How was your last order from SHOP365 Mart? Share your feedback.',         time: 'Yesterday' },
    { id: '6', type: 'promo',    read: true,  title: 'New Arrivals in Bakery', body: 'Fresh bread, cakes and pastries are now available in the Bakery section.',time: '2 days ago' },
    { id: '7', type: 'general',  read: true,  title: 'App Updated',            body: 'SHOP365 has been updated with a new look and faster checkout.',           time: '3 days ago' },
    { id: '8', type: 'delivery', read: true,  title: 'Delivery Rescheduled',   body: 'Your order #ORD-2799 delivery has been rescheduled to tomorrow 10 AM.',   time: '4 days ago' },
];

type NotificationStore = {
    notifications: Notification[];
    unreadCount: () => number;
    markRead: (id: string) => void;
    markAllRead: () => void;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: MOCK,
    unreadCount: () => get().notifications.filter((n) => !n.read).length,
    markRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
    markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
}));
