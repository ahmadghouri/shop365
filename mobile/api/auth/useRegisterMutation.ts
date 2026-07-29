import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/authStore';
import { register, type AuthResponse, type RegisterPayload } from './auth.service';

export function useRegisterMutation() {
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation<AuthResponse, Error, RegisterPayload>({
        mutationFn: register,
        onSuccess: async (data) => {
            await AsyncStorage.multiSet([
                ['token', data.token],
                ['user', JSON.stringify(data.data)],
            ]);
            setAuth(data.data, data.token);
        },
    });
}
