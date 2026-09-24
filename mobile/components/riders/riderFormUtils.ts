// Shared constants, types and helpers for the rider application UI.

export const VEHICLES = ['Bike', 'Bicycle', 'Scooter'] as const;
export type Vehicle = (typeof VEHICLES)[number];

// Field-level validation error keys.
export type FieldKey =
    | 'name'
    | 'phone'
    | 'cnic'
    | 'address'
    | 'cnicFront'
    | 'cnicBack'
    | 'photo'
    | 'vehiclePhoto';

// Human labels for the uploaded document keys returned by the backend.
export const DOC_LABELS: Record<string, string> = {
    cnic_front_image: 'CNIC Front',
    cnic_back_image: 'CNIC Back',
    photo_image: 'Your Photo',
    vehicle_image: 'Vehicle Photo',
};

// Format raw digits into the Pakistani CNIC pattern: 00000-0000000-0
export function formatCnic(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 13);
    const parts = [digits.slice(0, 5), digits.slice(5, 12), digits.slice(12, 13)].filter(Boolean);
    return parts.join('-');
}
