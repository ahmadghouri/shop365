import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
    id: number;
    phone_no: string;
    name?: string;
    [key: string]: any;
};

type AuthState = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => Promise<void>;
    loadToken: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
    },

    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    loadToken: async () => {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        if (token && userStr) {
            set({
                token,
                user: JSON.parse(userStr),
                isAuthenticated: true,
            });
        }
    },
}));
