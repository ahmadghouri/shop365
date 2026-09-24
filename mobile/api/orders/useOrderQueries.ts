import { useQuery } from '@tanstack/react-query';
import { fetchOrders, fetchOrderDetail, type Order, type OrderDetail } from './order.service';

export function useOrders() {
    return useQuery<Order[]>({
        queryKey: ['orders'],
        queryFn: fetchOrders,
    });
}

const TERMINAL_STATUSES = ['delivered', 'cancelled'];

export function useOrderDetail(orderId: string | null) {
    return useQuery<OrderDetail>({
        queryKey: ['order', orderId],
        queryFn: () => fetchOrderDetail(orderId!),
        enabled: !!orderId,
        // Keep the tracking screen live while the order is still in flight,
        // then stop once it reaches a terminal state.
        refetchInterval: (query) =>
            TERMINAL_STATUSES.includes(query.state.data?.status ?? '') ? false : 20000,
    });
}
