import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './apiClient';

export type Rider = {
    _id: string;
    name: string;
    phone_no: string;
    image?: string;
    vehicle_type?: string;
    vehicle_no?: string;
    business_id?: string | null;
    status?: string;
};

type AuthState = {
    token: string | null;
    rider: Rider | null;
    loading: boolean;
    /** App start par saved session load karo. */
    loadSession: () => Promise<void>;
    /** Phone + password se rider login. */
    login: (phone_no: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    rider: null,
    loading: true,

    loadSession: async () => {
        try {
            const token = await AsyncStorage.getItem('rider_token');
            const riderRaw = await AsyncStorage.getItem('rider_profile');
            set({
                token: token || null,
                rider: riderRaw ? JSON.parse(riderRaw) : null,
                loading: false,
            });
        } catch {
            set({ loading: false });
        }
    },

    login: async (phone_no, password) => {
        const res = await api.post('/rider/login', { phone_no, password });
        const token: string = res.data?.token;
        const rider: Rider = res.data?.data;
        await AsyncStorage.setItem('rider_token', token);
        await AsyncStorage.setItem('rider_profile', JSON.stringify(rider));
        set({ token, rider });
    },

    logout: async () => {
        await AsyncStorage.multiRemove(['rider_token', 'rider_profile']);
        set({ token: null, rider: null });
    },
}));
