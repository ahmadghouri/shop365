import api from '@/api/client';
import type { UpdateUserResponse, UserLocationPayload } from './user.types';

export async function updateUserLocation(
    userId: string | number,
    location: UserLocationPayload
): Promise<UpdateUserResponse> {
    const response = await api.put<UpdateUserResponse>(`/update/${userId}`, location);
    return response.data;
}
