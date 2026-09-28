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
    product_id: {
        title: string;
        price: number;
        image_url?: string;
        // business_id is a raw ObjectId string from `.populate('product_id')`,
        // or a populated object elsewhere — support both for reviews.
        business_id?: string | { _id?: string; name?: string };
    };
    quantity: number;
    price: number;
};

export type OrderRider = {
    _id: string;
    name: string;
    phone_no?: string;
    image?: string;
};

export type Order = {
    _id: string;
    total_price: number;
    status: string;
    createdAt: string;
    /** ISO timestamp of when the order is expected to arrive. */
    estimated_delivery_at?: string | null;
    /** ISO timestamp of when the order actually arrived. */
    delivered_at?: string | null;
    vendors?: string[];
    item_count?: number;
    items?: OrderItemDetail[];
    rider?: OrderRider | null;
};

export type OrderDetail = Order & {
    items: OrderItemDetail[];
    total_amount: number;
    delivery_charge: number;
    status_history?: { status: string; at: string; _id?: string }[];
    /** True once the customer has reviewed the vendor for this order. */
    reviewed?: boolean;
    /** True once the customer has reviewed the rider for this order. */
    rider_reviewed?: boolean;
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
