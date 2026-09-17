import api from '@/api/client';
import type { UpdateUserResponse, UserLocationPayload } from './user.types';

export async function updateUserProfile(
    userId: string | number,
    profile: { name: string; email: string; phone_no: string; date_of_birth?: string }
): Promise<UpdateUserResponse> {
    const response = await api.put<UpdateUserResponse>(`/update/${userId}`, profile);
    return response.data;
}

export async function updateUserLocation(
    userId: string | number,
    location: UserLocationPayload
): Promise<UpdateUserResponse> {
    const response = await api.put<UpdateUserResponse>(`/update/${userId}`, location);
    return response.data;
}

export async function updateUserAvatar(
    userId: string | number,
    imageUri: string
): Promise<UpdateUserResponse> {
    const formData = new FormData();
    formData.append('image', {
        uri: imageUri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
    } as any);
    const response = await api.put<UpdateUserResponse>(`/update/${userId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}
