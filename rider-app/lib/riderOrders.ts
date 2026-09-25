import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './apiClient';

export type RiderOrderItem = {
    product_id: { title?: string; price?: number; image_url?: string } | null;
    quantity: number;
    price: number;
};

export type RiderOrder = {
    _id: string;
    total_price: number;
    delivery_fee: number;
    status: string;
    createdAt: string;
    user: { _id?: string; name?: string; phone_no?: string; address?: string };
    items: RiderOrderItem[];
};

export type RiderOrderStatus = 'picked_up' | 'out_for_delivery' | 'delivered' | 'cancelled';

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
        refetchInterval: 20000,
    });
}

export function useUpdateRiderOrderStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: RiderOrderStatus }) =>
            updateRiderOrderStatus(orderId, status),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['riderOrders'] }),
    });
}
