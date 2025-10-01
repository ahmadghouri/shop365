import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api/pos-products'
});

export function fetchProducts(params: any) {
  return api.get('/', { params });
}

export function importProducts(locno: number) {
  return api.post('/import', { locno });
}