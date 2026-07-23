import { useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { useAuthStore } from '../authStore';

type RegisterPayload = {
    phone_no: string;
    password: string;
};

type AuthResponse = {
    message: string;
    token: string;
    data: any;
};

export function useRegisterMutation() {
    const { setAuth } = useAuthStore();

    return useMutation<AuthResponse, Error, RegisterPayload>({
        mutationFn: async (payload) => {
            const response = await api.post('/register', payload);
            return response.data;
        },
        onSuccess: async (data) => {
            await AsyncStorage.setItem('token', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(data.data));
            setAuth(data.data, data.token);
        },
    });
}
