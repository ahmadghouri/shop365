import { useQuery } from '@tanstack/react-query';
import { getProduct } from './product.service';

export const productQueryKeys = {
    detail: (productId: string) => ['products', 'detail', productId] as const,
};

export function useProductQuery(productId: string) {
    return useQuery({
        queryKey: productQueryKeys.detail(productId),
        queryFn: () => getProduct(productId),
        enabled: Boolean(productId),
    });
}
