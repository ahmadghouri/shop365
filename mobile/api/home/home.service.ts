import api from '@/api/client';

export type CategoryProductsParams = {
    type?: string;
    search?: string;
};

export type CategoryProductsResponse = {
    types: string[];
    products: any[];
};

export async function getBusinesses() {
    const response = await api.get('/business');
    return response.data.data;
}

export async function getCategories() {
    const response = await api.get('/categories');
    return response.data.data;
}

export async function getCategoryProducts(
    categoryId: string,
    params: CategoryProductsParams = {},
): Promise<CategoryProductsResponse> {
    const response = await api.get(`/categories/${categoryId}/products`, {
        params: {
            type: params.type && params.type !== 'All' ? params.type : undefined,
            search: params.search?.trim() || undefined,
        },
    });
    return response.data.data;
}

export async function getHeaderImages() {
    const response = await api.get('/header-images');
    return response.data;
}

export async function getRandomProducts() {
    const response = await api.get('/random-products');
    return response.data.data;
}
