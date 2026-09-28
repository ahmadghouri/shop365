import { useEffect, useMemo, useRef, useState } from 'react';
import type { Order, OrderDetail } from '@/api/orders/order.service';

/** Pull the vendor's business id out of an order's items (raw ObjectId or populated). */
export function orderBusinessId(order?: Order): string | null {
    const biz = order?.items?.[0]?.product_id?.business_id;
    if (!biz) return null;
    return typeof biz === 'string' ? biz : (biz._id ?? null);
}

/**
 * Encapsulates the post-delivery review flow: what still needs reviewing
 * (vendor / rider), whether to auto-open the modal, and the local submitted
 * state. Backend flags (`reviewed`, `rider_reviewed`) ensure it never
 * re-prompts once an order has been reviewed.
 */
export function useOrderReview(order: Order | undefined, detail: OrderDetail | undefined) {
    const delivered = order?.status === 'delivered';
    const businessId = orderBusinessId(order);
    const hasRider = !!order?.rider?._id;

    const needVendorReview = !!businessId && !detail?.reviewed;
    const needRiderReview = hasRider && !detail?.rider_reviewed;

    const [locallyReviewed, setLocallyReviewed] = useState(false);
    const canReview = (needVendorReview || needRiderReview) && !locallyReviewed;
    const alreadyReviewed = locallyReviewed || (!needVendorReview && !needRiderReview);

    const [showReview, setShowReview] = useState(false);
    const autoPromptedRef = useRef(false);
    useEffect(() => {
        if (delivered && canReview && !autoPromptedRef.current) {
            autoPromptedRef.current = true;
            setShowReview(true);
        }
    }, [delivered, canReview]);

    return useMemo(
        () => ({
            delivered,
            businessId,
            needVendorReview,
            needRiderReview,
            canReview,
            alreadyReviewed,
            showReview,
            openReview: () => setShowReview(true),
            closeReview: () => setShowReview(false),
            markReviewed: () => setLocallyReviewed(true),
        }),
        [
            delivered,
            businessId,
            needVendorReview,
            needRiderReview,
            canReview,
            alreadyReviewed,
            showReview,
        ]
    );
}
