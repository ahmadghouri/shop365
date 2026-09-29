import { useQuery } from '@tanstack/react-query';
import {
    fetchProviderDetail,
    fetchProviderReviews,
    fetchProvidersByCategory,
    type ProviderDetail,
    type ProviderReview,
    type ProviderListItem,
} from './providerDetail.service';

export function useProviderDetail(businessId: string) {
    return useQuery<ProviderDetail>({
        queryKey: ['providerDetail', businessId],
        queryFn: () => fetchProviderDetail(businessId),
        enabled: !!businessId,
    });
}

export function useProviderReviews(businessId: string) {
    return useQuery<ProviderReview[]>({
        queryKey: ['providerReviews', businessId],
        queryFn: () => fetchProviderReviews(businessId),
        enabled: !!businessId,
    });
}

export function useProvidersByCategory(categoryId: string) {
    return useQuery<ProviderListItem[]>({
        queryKey: ['providersByCategory', categoryId],
        queryFn: () => fetchProvidersByCategory(categoryId),
        enabled: !!categoryId,
    });
}
