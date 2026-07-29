import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/authStore';
import { updateUserLocation } from './user.service';
import type { UserLocationPayload } from './user.types';

type UpdateLocationVariables = {
    userId: string | number;
    location: UserLocationPayload;
};

export function useUpdateLocationMutation() {
    const updateUser = useAuthStore((state) => state.updateUser);

    return useMutation({
        mutationFn: ({ userId, location }: UpdateLocationVariables) =>
            updateUserLocation(userId, location),
        onSuccess: async (data) => {
            if (data.user) await updateUser(data.user);
        },
        onError: (error) => {
            console.log('Unable to save detected address:', error);
        },
    });
}
