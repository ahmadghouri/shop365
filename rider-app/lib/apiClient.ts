import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// EXPO_PUBLIC_API_URL se aata hai; warna local dev fallback.
function getBaseUrl() {
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
    if (Platform.OS === 'web') return 'http://localhost:8000';
    return 'http://192.168.79.28:8000';
}

export const API_BASE_URL = getBaseUrl();

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Rider token har request par lag jaye.
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('rider_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
