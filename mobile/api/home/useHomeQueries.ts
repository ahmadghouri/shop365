import { useQuery } from '@tanstack/react-query';
import {
    getBusinesses,
    getCategories,
    getCategoryProducts,
    getHeaderImages,
    getRandomProducts,
} from './home.service';

export const homeQueryKeys = {
    businesses: ['home', 'businesses'] as const,
    categories: ['home', 'categories'] as const,
    categoryProducts: (categoryId: string, type: string, search: string) =>
        ['home', 'category-products', categoryId, type, search] as const,
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

export function useCategoryProducts(
    categoryId: string,
    type = 'All',
    search = '',
) {
    return useQuery({
        queryKey: homeQueryKeys.categoryProducts(categoryId, type, search),
        queryFn: () => getCategoryProducts(categoryId, { type, search }),
        enabled: Boolean(categoryId),
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
