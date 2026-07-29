import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
    _id?: string;
    id?: string | number;
    phone_no: string;
    name?: string;
    address?: string;
    street?: string;
    area?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    [key: string]: any;
};

type AuthState = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    updateUser: (user: User) => Promise<void>;
    logout: () => Promise<void>;
    loadToken: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
    },

    updateUser: async (updatedUser) => {
        const user = { ...get().user, ...updatedUser } as User;
        await AsyncStorage.setItem('user', JSON.stringify(user));
        set({ user });
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
