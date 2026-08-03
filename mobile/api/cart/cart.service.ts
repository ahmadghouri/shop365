import api from '@/api/client';

export type CartItemPayload = {
    product_id: string;
    quantity: number;
    variant?: { id: string; name: string; price: number };
    extras?: { id: string; name: string; price: number }[];
};

export async function addToCart(payload: CartItemPayload) {
    const response = await api.post('/cart', payload);
    return response.data.data;
}

export async function getCart() {
    const response = await api.get('/cart');
    return response.data.data;
}

export async function removeCartItem(cartItemId: string) {
    const response = await api.delete(`/cart/${cartItemId}`);
    return response.data;
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
    const response = await api.patch(`/cart/update/${cartItemId}`, { quantity });
    return response.data.data;
}

export async function clearCart() {
    const response = await api.delete('/cart');
    return response.data;
}

export async function getCartItemCount() {
    const response = await api.get('/cart/item-count');
    return response.data.item_count;
}
