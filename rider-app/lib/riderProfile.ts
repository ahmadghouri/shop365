import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './apiClient';
import { useAuthStore } from './authStore';

export type RiderProfile = {
    _id: string;
    name: string;
    phone_no: string;
    image?: string;
    cnic?: string;
    license_no?: string;
    vehicle_type?: 'bike' | 'car';
    vehicle_no?: string;
    status?: string;
    createdAt?: string;
    rider_type: 'restaurant' | 'platform';
    business: { _id: string; name: string; image?: string } | null;
    stats: { deliveries: number; rating: number; reviews: number; member_since?: string };
    recent_reviews: { _id: string; rating: number; comments: string; customer: string; createdAt: string }[];
};

export function useRiderProfile() {
    return useQuery<RiderProfile>({
        queryKey: ['riderProfile'],
        queryFn: async () => (await api.get<{ data: RiderProfile }>('/rider/me')).data.data,
        staleTime: 60_000,
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: (body: { current_password: string; new_password: string }) =>
            api.put('/rider/me/password', body).then((r) => r.data),
    });
}

export function useUpdatePhoto() {
    const qc = useQueryClient();
    const updateRider = useAuthStore((s) => s.updateRider);
    return useMutation({
        mutationFn: async (uri: string) => {
            const form = new FormData();
            form.append('image', { uri, name: 'photo.jpg', type: 'image/jpeg' } as any);
            const res = await api.put<{ data: { image: string } }>('/rider/me/photo', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000,
            });
            return res.data.data.image;
        },
        onSuccess: async (image) => {
            await updateRider({ image });
            qc.invalidateQueries({ queryKey: ['riderProfile'] });
        },
    });
}
