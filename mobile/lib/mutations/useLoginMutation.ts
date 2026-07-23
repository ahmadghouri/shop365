import { useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { useAuthStore } from '../authStore';

type LoginPayload = {
    phone_no: string;
    password: string;
};

type AuthResponse = {
    message: string;
    token: string;
    data: any;
};

export function useLoginMutation() {
    const { setAuth } = useAuthStore();

    return useMutation<AuthResponse, Error, LoginPayload>({
        mutationFn: async (payload) => {
            const response = await api.post('/login', payload);
            return response.data;
        },
        onSuccess: async (data) => {
            await AsyncStorage.setItem('token', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(data.data));
            setAuth(data.data, data.token);
        },
    });
}
