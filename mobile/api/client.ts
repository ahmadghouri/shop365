import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Auto-detect base URL based on platform
// Web: localhost works directly
// Android Emulator: 10.0.2.2 maps to host machine's localhost
// Physical Device: Use your PC's WiFi IP (run 'ipconfig' in CMD)
const getBaseUrl = () => {
    if (Platform.OS === 'web') {
        return 'http://localhost:8000';
    }
    // IMPORTANT: Replace with your actual reachable URL
    // Option 1: If using ngrok, paste ngrok URL here (e.g., https://abc123.ngrok-free.app)
    // Option 2: If both phone & PC on same WiFi, use PC's WiFi IP
    // Option 3: For emulator only, use http://10.0.2.2:8000
    return 'http://192.168.79.28:8000';
    // return 'https://theshop365.com';
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
