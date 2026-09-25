import api from './apiClient';

export type RiderApplicationPayload = {
    name: string;
    phone_no: string;
    cnic: string;
    address: string;
    vehicle_type: string;
    vehicle_no: string;
    cnicFront: string; // local image uri
    cnicBack: string;
    photo: string;
    vehiclePhoto: string;
};

function appendImage(form: FormData, field: string, uri: string) {
    form.append(field, {
        uri,
        name: `${field}.jpg`,
        type: 'image/jpeg',
    } as any);
}

/** Public rider application (no login) — goes to admin for approval. */
export async function submitRiderApplication(payload: RiderApplicationPayload) {
    const form = new FormData();
    form.append('name', payload.name);
    form.append('phone_no', payload.phone_no);
    form.append('cnic', payload.cnic);
    form.append('address', payload.address);
    form.append('vehicle_type', payload.vehicle_type);
    form.append('vehicle_no', payload.vehicle_no);
    appendImage(form, 'cnic_front_image', payload.cnicFront);
    appendImage(form, 'cnic_back_image', payload.cnicBack);
    appendImage(form, 'photo_image', payload.photo);
    appendImage(form, 'vehicle_image', payload.vehiclePhoto);

    const res = await api.post('/rider-applications/public', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
}
