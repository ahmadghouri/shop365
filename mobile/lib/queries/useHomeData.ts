import { useQuery } from '@tanstack/react-query';
import api from '../api';

// Fetch businesses (categories like Food, Grocery, Clothes, etc.)
export function useBusinesses() {
    return useQuery({
        queryKey: ['businesses'],
        queryFn: async () => {
            const response = await api.get('/business');
            return response.data.data;
        },
    });
}

// Fetch header/carousel images
export function useHeaderImages() {
    return useQuery({
        queryKey: ['headerImages'],
        queryFn: async () => {
            const response = await api.get('/header-images');
            return response.data;
        },
    });
}

// Fetch discounted/random products
export function useRandomProducts() {
    return useQuery({
        queryKey: ['randomProducts'],
        queryFn: async () => {
            const response = await api.get('/random-products');
            return response.data.data;
        },
    });
}
