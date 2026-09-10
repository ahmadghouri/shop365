import { useQuery } from '@tanstack/react-query';
import { fetchOrders, fetchOrderDetail, type Order, type OrderDetail } from './order.service';

export function useOrders() {
    return useQuery<Order[]>({
        queryKey: ['orders'],
        queryFn: fetchOrders,
    });
}

export function useOrderDetail(orderId: string | null) {
    return useQuery<OrderDetail>({
        queryKey: ['order', orderId],
        queryFn: () => fetchOrderDetail(orderId!),
        enabled: !!orderId,
    });
}
