import api from '@/api/client';

export async function getProduct(productId: string) {
    const response = await api.get(`/products/${productId}`);
    return response.data.data;
}
