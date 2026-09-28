import apiClient from '@/api/client';

export type SubmitReviewPayload = {
    business_id: string;
    order_id: string;
    rating: number; // 1..5
    comments: string;
};

/** Submit a review for a delivered order's vendor. */
export async function submitReview(payload: SubmitReviewPayload): Promise<{ message: string }> {
    const { data } = await apiClient.post('/reviews', payload);
    return data;
}

export type MyReview = {
    _id: string;
    type: 'vendor' | 'rider';
    order_id: string;
    rating: number;
    comments: string;
    reply?: string;
    createdAt: string;
    target_name: string;
    target_image?: string;
    /** First product image of the order, for the review card. */
    product_image?: string;
};

/** The logged-in customer's own reviews (vendor + rider), newest first. */
export async function fetchMyReviews(): Promise<MyReview[]> {
    const { data } = await apiClient.get<{ data: MyReview[] }>('/my-reviews');
    return Array.isArray(data?.data) ? data.data : [];
}

export type SubmitRiderReviewPayload = {
    order_id: string;
    rating: number; // 1..5
    comments?: string;
};

/** Submit a review for the rider who delivered the order. */
export async function submitRiderReview(
    payload: SubmitRiderReviewPayload
): Promise<{ message: string }> {
    const { data } = await apiClient.post('/rider-reviews', payload);
    return data;
}
