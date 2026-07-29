import { useQuery } from '@tanstack/react-query';
import { getBusinesses, getCategories, getHeaderImages, getRandomProducts } from './home.service';

export const homeQueryKeys = {
    businesses: ['home', 'businesses'] as const,
    categories: ['home', 'categories'] as const,
    headerImages: ['home', 'header-images'] as const,
    randomProducts: ['home', 'random-products'] as const,
};

export function useBusinesses() {
    return useQuery({
        queryKey: homeQueryKeys.businesses,
        queryFn: getBusinesses,
    });
}

export function useCategories() {
    return useQuery({
        queryKey: homeQueryKeys.categories,
        queryFn: getCategories,
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnReconnect: true,
    });
}

export function useHeaderImages() {
    return useQuery({
        queryKey: homeQueryKeys.headerImages,
        queryFn: getHeaderImages,
    });
}

export function useRandomProducts() {
    return useQuery({
        queryKey: homeQueryKeys.randomProducts,
        queryFn: getRandomProducts,
    });
}
