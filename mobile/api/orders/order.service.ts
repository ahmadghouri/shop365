import apiClient from '@/api/client';

export type PlaceOrderPayload = {
    address_id?: string;
    voucher_code?: string;
    payment_method?: string;
    screenshot_uri?: string;
    excluded_business_ids?: string[];
};

export type OrderItemDetail = {
    _id: string;
    product_id: { title: string; price: number; image_url?: string; business_id?: { name: string } };
    quantity: number;
    price: number;
};

export type Order = {
    _id: string;
    total_price: number;
    status: string;
    createdAt: string;
    vendors?: string[];
    item_count?: number;
    items?: OrderItemDetail[];
};

export type OrderDetail = Order & {
    items: OrderItemDetail[];
    total_amount: number;
    delivery_charge: number;
    status_history?: { status: string; at: string; _id?: string }[];
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
