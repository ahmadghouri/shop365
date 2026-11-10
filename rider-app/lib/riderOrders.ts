import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './apiClient';

export type RiderOrderItem = {
    product_id: { title?: string; price?: number; image_url?: string } | null;
    quantity: number;
    price: number;
};

export type RiderOrderPlace = {
    name?: string;
    label?: string;
    address?: string;
    latitude: number | null;
    longitude: number | null;
};

export type RiderOrder = {
    _id: string;
    total_price: number;
    delivery_fee: number;
    status: string;
    createdAt: string;
    user: { _id?: string; name?: string; phone_no?: string; address?: string };
    /** The business to collect from (location may be missing). */
    pickup?: RiderOrderPlace | null;
    /** The customer's delivery address (coordinates may be missing). */
    dropoff?: RiderOrderPlace | null;
    items: RiderOrderItem[];
};

/** Send the rider's live GPS position (forwarded to the customer). */
export async function sendRiderLocation(latitude: number, longitude: number) {
    await api.post('/rider/location', { latitude, longitude });
}

export type RiderOrderStatus = 'picked_up' | 'out_for_delivery' | 'delivered';

async function fetchRiderOrders(): Promise<RiderOrder[]> {
    const res = await api.get<{ data: RiderOrder[] }>('/rider/orders');
    return Array.isArray(res.data?.data) ? res.data.data : [];
}

async function updateRiderOrderStatus(orderId: string, status: RiderOrderStatus) {
    const res = await api.put(`/rider/orders/${orderId}/status`, { status });
    return res.data?.data;
}

export function useRiderOrders() {
    return useQuery<RiderOrder[]>({
        queryKey: ['riderOrders'],
        queryFn: fetchRiderOrders,
        // No polling: orders reload on pull-to-refresh, after the rider
        // accepts/updates an order, and when the app comes back to the
        // foreground.
        refetchInterval: false,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
    });
}

/** Drop a delivery with a reason; the restaurant (and admin) decide what's next. */
async function cancelDelivery(orderId: string, reason: string) {
    const res = await api.post(`/rider/orders/${orderId}/cancel`, { reason });
    return res.data;
}

export function useCancelDelivery() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
            cancelDelivery(orderId, reason),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['riderOrders'] });
            qc.invalidateQueries({ queryKey: ['riderOrderHistory'] });
            qc.invalidateQueries({ queryKey: ['riderWallet'] });
        },
    });
}

export function useUpdateRiderOrderStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: RiderOrderStatus }) =>
            updateRiderOrderStatus(orderId, status),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['riderOrders'] });
            qc.invalidateQueries({ queryKey: ['riderOrderHistory'] });
            qc.invalidateQueries({ queryKey: ['riderWallet'] });
        },
    });
}

// ---- History (delivered + dropped) ----

export type RiderHistoryOrder = {
    _id: string;
    outcome: 'delivered' | 'dropped';
    status: string;
    total_price: number;
    delivery_fee: number;
    createdAt: string;
    delivered_at: string | null;
    dropped_at: string | null;
    drop_reason: string;
    business_name: string;
    customer: { name: string; phone_no: string };
    address: string;
    address_label: string;
    items: { title: string; image_url?: string; quantity: number; price: number }[];
};

export type RiderHistorySummary = {
    today_count: number;
    today_earnings: number;
    total_count: number;
    total_earnings: number;
};

type HistoryPage = {
    data: RiderHistoryOrder[];
    summary: RiderHistorySummary;
    page: number;
    has_more: boolean;
};

async function fetchRiderHistory(page: number): Promise<HistoryPage> {
    const res = await api.get<HistoryPage>('/rider/orders/history', { params: { page, per_page: 20 } });
    return res.data;
}

export function useRiderOrderHistory(enabled = true) {
    return useInfiniteQuery({
        queryKey: ['riderOrderHistory'],
        queryFn: ({ pageParam }) => fetchRiderHistory(pageParam),
        initialPageParam: 1,
        getNextPageParam: (last) => (last.has_more ? last.page + 1 : undefined),
        enabled,
        staleTime: 60_000,
    });
}

// ---- Wallet ----

type Periods = { today: number; week: number; month: number; total: number };

export type RiderWallet = {
    earnings: Periods;
    cash_collected: Periods;
    deliveries: Periods;
    daily: { date: string; earnings: number; count: number }[];
    recent: {
        order_id: string;
        delivered_at: string;
        amount: number;
        order_total: number;
        business_name: string;
    }[];
};

export function useRiderWallet(enabled = true) {
    return useQuery<RiderWallet>({
        queryKey: ['riderWallet'],
        queryFn: async () => (await api.get<{ data: RiderWallet }>('/rider/wallet')).data.data,
        enabled,
        staleTime: 60_000,
    });
}
