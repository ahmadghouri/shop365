import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/authStore';
import { login, type AuthResponse, type LoginPayload } from './auth.service';

export function useLoginMutation() {
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation<AuthResponse, Error, LoginPayload>({
        mutationFn: login,
        onSuccess: async (data) => {
            await AsyncStorage.multiSet([
                ['token', data.token],
                ['user', JSON.stringify(data.data)],
            ]);
            setAuth(data.data, data.token);
        },
    });
}
