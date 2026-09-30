import apiClient from '@/api/client';

export type ProviderProduct = {
    _id?: string;
    id?: string;
    title: string;
    price: number;
    final_price?: number;
    discount?: number;
    discount_type?: 'percentage' | 'flat';
    type?: string;
    image?: string;
    image_url?: string;
};

export type ProviderDetail = {
    _id: string;
    id?: string;
    name: string;
    type?: string;
    image?: string;
    address?: string;
    opening_time?: string;
    closing_time?: string;
    delivery_fee?: number;
    minimum_order?: number;
    discount?: number;
    reviews_count: number;
    reviews_avg_rating: number;
    products: ProviderProduct[];
};

/** Business detail + its active products + review stats (single call). */
export async function fetchProviderDetail(businessId: string): Promise<ProviderDetail> {
    const { data } = await apiClient.get(`/business/${businessId}`);
    return data.data;
}

export type ProviderReview = {
    _id: string;
    rating: number;
    comments: string;
    reply?: string;
    createdAt: string;
    user_id?: { name?: string };
};

/** Reviews for a business, newest first. */
export async function fetchProviderReviews(businessId: string): Promise<ProviderReview[]> {
    const { data } = await apiClient.get(`/reviews/${businessId}`);
    return Array.isArray(data?.reviews?.data) ? data.reviews.data : [];
}

export type ProviderListItem = {
    _id?: string;
    id?: string;
    name: string;
    type?: string;
    image?: string;
    image_url?: string;
    discount?: number;
    delivery_fee?: number;
    reviews_count?: number;
    reviews_avg_rating?: number;
};

/** Providers that belong to a given category. */
export async function fetchProvidersByCategory(
    categoryId: string
): Promise<ProviderListItem[]> {
    const { data } = await apiClient.get('/business', {
        params: { category_id: categoryId },
    });
    return Array.isArray(data?.data) ? data.data : [];
}
