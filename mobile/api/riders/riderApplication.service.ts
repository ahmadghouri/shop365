import api from '@/api/client';

export type RiderApplicationPayload = {
    name: string;
    phone_no: string;
    cnic: string;
    address: string;
    vehicle_type: string;
    cnicFront: string; // local image uri
    cnicBack: string;
    photo: string;
    vehiclePhoto: string;
};

export type RiderApplicationResponse = {
    status: boolean;
    message: string;
    data?: unknown;
};

function appendImage(form: FormData, field: string, uri: string) {
    form.append(field, {
        uri,
        name: `${field}.jpg`,
        type: 'image/jpeg',
    } as any);
}

export type DocStatus = 'pending' | 'approved' | 'rejected' | 'resend';

export type RiderDocument = {
    status: DocStatus;
    note?: string;
};

export type RiderApplication = {
    _id: string;
    name: string;
    phone_no: string;
    cnic: string;
    address: string;
    vehicle_type: string;
    cnic_front_image?: string;
    cnic_back_image?: string;
    photo_image?: string;
    vehicle_image?: string;
    status: 'pending' | 'approved' | 'rejected';
    documents?: {
        cnic_front_image?: RiderDocument;
        cnic_back_image?: RiderDocument;
        photo_image?: RiderDocument;
        vehicle_image?: RiderDocument;
    };
    admin_message?: string;
    createdAt: string;
    updatedAt: string;
};

export async function getMyRiderApplication(): Promise<RiderApplication | null> {
    const response = await api.get<{ data: RiderApplication | null }>('/rider-applications/me');
    return response.data?.data ?? null;
}

// Re-upload only the documents the admin asked for. `images` maps a document
// field name (e.g. cnic_front_image) to a local image uri.
export async function reuploadRiderDocuments(
    images: Partial<Record<string, string>>
): Promise<RiderApplicationResponse> {
    const form = new FormData();
    Object.entries(images).forEach(([field, uri]) => {
        if (uri) appendImage(form, field, uri);
    });
    const response = await api.post<RiderApplicationResponse>(
        '/rider-applications/reupload',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
}

export async function submitRiderApplication(
    payload: RiderApplicationPayload
): Promise<RiderApplicationResponse> {
    const form = new FormData();
    form.append('name', payload.name);
    form.append('phone_no', payload.phone_no);
    form.append('cnic', payload.cnic);
    form.append('address', payload.address);
    form.append('vehicle_type', payload.vehicle_type);
    appendImage(form, 'cnic_front_image', payload.cnicFront);
    appendImage(form, 'cnic_back_image', payload.cnicBack);
    appendImage(form, 'photo_image', payload.photo);
    appendImage(form, 'vehicle_image', payload.vehiclePhoto);

    const response = await api.post<RiderApplicationResponse>('/rider-applications', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}
