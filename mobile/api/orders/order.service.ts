import apiClient from '@/api/client';

export type PlaceOrderPayload = {
    address_id?: string;
    voucher_code?: string;
    payment_method?: string;
    screenshot_uri?: string;
};

export type Order = {
    _id: string;
    total_price: number;
    status: string;
    createdAt: string;
    vendors?: string[];
    item_count?: number;
    items?: { quantity: number }[];
};

export type OrderDetail = Order & {
    items: {
        _id: string;
        product_id: { title: string; price: number; image_url?: string; business_id?: { name: string } };
        quantity: number;
        price: number;
    }[];
    delivery_charge: number;
    total_amount: number;
};

export async function placeOrder(payload: PlaceOrderPayload) {
    const { data } = await apiClient.post('/order', payload);
    return data;
}

export async function fetchOrders(): Promise<Order[]> {
    const { data } = await apiClient.get('/order');
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
}

export async function fetchOrderDetail(orderId: string): Promise<OrderDetail> {
    const { data } = await apiClient.get(`/orders/${orderId}`);
    return data;
}
