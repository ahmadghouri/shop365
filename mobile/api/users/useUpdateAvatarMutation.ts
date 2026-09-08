import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/authStore';
import { updateUserAvatar } from './user.service';
import type { UpdateUserResponse } from './user.types';

type UpdateAvatarVariables = {
    userId: string | number;
    imageUri: string;
};

export function useUpdateAvatarMutation() {
    const updateUser = useAuthStore((state) => state.updateUser);

    return useMutation({
        mutationFn: ({ userId, imageUri }: UpdateAvatarVariables) =>
            updateUserAvatar(userId, imageUri),
        onSuccess: async (data: UpdateUserResponse) => {
            if (data.user) await updateUser(data.user);
        },
        onError: (error) => {
            console.log('Unable to save profile image:', error);
        },
    });
}
