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
