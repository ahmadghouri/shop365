import api, { API_BASE_URL } from '@/api/client';

export type MonthlyGroceryProduct = {
    _id: string;
    id?: string;
    title: string;
    price: number;
    final_price?: number;
    image?: string;
    image_url?: string;
    business_id?: { _id: string; name: string; type?: string };
};

export type MonthlyGroceryItem = {
    _id: string;
    product_id: MonthlyGroceryProduct | null;
    variant?: { name: string; price: number };
    quantity: number;
    checked: boolean;
};

export type MonthlyGroceryCard = {
    _id: string;
    id?: string;
    name: string;
    items: MonthlyGroceryItem[];
    createdAt?: string;
};

export type CreateMonthlyGroceryCardPayload = {
    name: string;
};

export function getMonthlyProductImage(product?: MonthlyGroceryProduct | null) {
    const rawImage = product?.image_url || product?.image || '';
    if (!rawImage) return undefined;
    if (/^https?:\/\//.test(rawImage)) return rawImage;
    let path = String(rawImage).replace(/^\/be\/uploads\//, '/uploads/');
    path = path.replace(/^\/uploads\/uploads\//, '/uploads/');
    if (!path.startsWith('/')) path = `/uploads/${path}`;
    return `${API_BASE_URL}${path}`;
}

export async function getMonthlyGroceryCards(): Promise<MonthlyGroceryCard[]> {
    const response = await api.get('/monthly-grocery-cards');
    return response.data.data?.cards || [];
}

export async function createMonthlyGroceryCard(
    payload: CreateMonthlyGroceryCardPayload,
): Promise<MonthlyGroceryCard> {
    const response = await api.post('/monthly-grocery-cards', payload);
    return response.data.data.card;
}

export async function getMonthlyGroceryCard(cardId: string): Promise<MonthlyGroceryCard> {
    const response = await api.get(`/monthly-grocery-cards/${cardId}`);
    return response.data.data.card;
}

export async function deleteMonthlyGroceryCard(cardId: string) {
    await api.delete(`/monthly-grocery-cards/${cardId}`);
}

export async function addMonthlyGroceryItem(
    cardId: string,
    productId: string,
    quantity: number,
    variant?: { name: string; price: number },
): Promise<MonthlyGroceryCard> {
    const response = await api.post(`/monthly-grocery-cards/${cardId}/items`, {
        product_id: productId,
        quantity,
        variant,
    });
    return response.data.data.card;
}

export async function updateMonthlyGroceryItem(
    cardId: string,
    itemId: string,
    updates: { quantity?: number; checked?: boolean },
): Promise<MonthlyGroceryCard> {
    const response = await api.patch(`/monthly-grocery-cards/${cardId}/items/${itemId}`, updates);
    return response.data.data.card;
}

export async function removeMonthlyGroceryItem(cardId: string, itemId: string) {
    const response = await api.delete(`/monthly-grocery-cards/${cardId}/items/${itemId}`);
    return response.data.data.card as MonthlyGroceryCard;
}