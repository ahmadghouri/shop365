import api from '@/api/client';

export async function getBusinesses() {
    const response = await api.get('/business');
    return response.data.data;
}

export async function getCategories() {
    const response = await api.get('/categories');
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
