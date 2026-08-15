import api from '@/api/client';

export type AppSettings = {
    min_order_price: number;
    delivery_fee: number;
};

export async function getSettings() {
    const response = await api.get('/settings');
    return response.data.data as AppSettings;
}
