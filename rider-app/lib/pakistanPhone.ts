// Pakistan phone helpers — mobile app se milte-julte, rider-app ke liye.

/** Sirf digits rakho, max 11 (03XXXXXXXXX). */
export function sanitizePakistanPhoneDigits(value: string): string {
    return String(value || '').replace(/\D/g, '').slice(0, 11);
}

/** Display format: "300 1234567" (leading 0 handle karke). */
export function formatPakistanPhoneNumber(value: string): string {
    const d = sanitizePakistanPhoneDigits(value);
    const local = d.startsWith('0') ? d.slice(1) : d;
    if (local.length <= 3) return local;
    return `${local.slice(0, 3)} ${local.slice(3, 10)}`;
}

/** Backend ke liye local format: 03XXXXXXXXX. */
export function toPakistanLocal(value: string): string {
    const d = sanitizePakistanPhoneDigits(value);
    if (d.startsWith('0')) return d;
    if (d.startsWith('3')) return `0${d}`;
    return d;
}

/** Validation — valid ho to null, warna error message. */
export function validatePakistanPhoneNumber(value: string): string | null {
    const d = sanitizePakistanPhoneDigits(value);
    const local = d.startsWith('0') ? d : `0${d}`;
    if (!local) return 'Phone number is required';
    if (!/^03\d{9}$/.test(local)) return 'Enter a valid Pakistani mobile number';
    return null;
}
