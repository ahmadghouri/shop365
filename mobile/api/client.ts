import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Reads from .env → EXPO_PUBLIC_API_URL
// Falls back to local dev URLs if not set
const getBaseUrl = () => {
    // Production: set in .env as EXPO_PUBLIC_API_URL=https://pakmovie.online
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // Local development fallback
    if (Platform.OS === 'web') {
        return 'http://localhost:8000';
    }
    return 'http://192.168.0.197:8000';
};

export const API_BASE_URL = getBaseUrl();

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add token to requests automatically
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Log errors for debugging
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log('API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
        });
        return Promise.reject(error);
    }
);

export default api;
