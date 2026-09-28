import { useMutation } from '@tanstack/react-query';
import { submitReview, type SubmitReviewPayload } from './review.service';

export function useSubmitReview() {
    return useMutation({
        mutationFn: (payload: SubmitReviewPayload) => submitReview(payload),
    });
}
