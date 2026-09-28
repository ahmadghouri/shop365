import { useQuery } from '@tanstack/react-query';
import { fetchMyReviews, type MyReview } from './review.service';

export function useMyReviews() {
    return useQuery<MyReview[]>({
        queryKey: ['myReviews'],
        queryFn: fetchMyReviews,
    });
}
