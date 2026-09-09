import { useQuery } from '@tanstack/react-query';
import { fetchOrders, fetchOrderDetail } from './order.service';

export function useOrders() {
    return useQuery({
        queryKey: ['orders'],
        queryFn: fetchOrders,
    });
}

export function useOrderDetail(orderId: string | null) {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: () => fetchOrderDetail(orderId!),
        enabled: !!orderId,
    });
}
