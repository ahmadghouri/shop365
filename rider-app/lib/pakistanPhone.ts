// Pakistan phone helpers — same logic as the customer mobile app.
// The number is kept as 10 national digits ("3XXXXXXXXX"); the "+92" prefix is
// shown separately in the UI.

/**
 * Digits only, without country code / leading 0, max 10.
 * Accepts "0300 1234567", "+92 300 1234567", "0092300…", "300…".
 */
export function sanitizePakistanPhoneDigits(value: string): string {
    const digits = String(value || '').replace(/\D/g, '');
    const withoutCountryCode = digits.startsWith('0092')
        ? digits.slice(4)
        : digits.startsWith('92') && digits.length > 10
            ? digits.slice(2)
            : digits.startsWith('0')
                ? digits.slice(1)
                : digits;

    return withoutCountryCode.slice(0, 10);
}

/** Display format: "+92 300 1234567". */
export function formatPakistanPhoneNumber(value: string): string {
    const digits = sanitizePakistanPhoneDigits(value);
    if (!digits) return '+92';
    if (digits.length <= 3) return `+92 ${digits}`;
    return `+92 ${digits.slice(0, 3)} ${digits.slice(3)}`;
}

/** International format: "+923001234567". */
export function toPakistanE164(value: string): string {
    return `+92${sanitizePakistanPhoneDigits(value)}`;
}

/** Backend format: "03001234567". */
export function toPakistanLocal(value: string): string {
    return `0${sanitizePakistanPhoneDigits(value)}`;
}

/** null when valid, otherwise an error message. */
export function validatePakistanPhoneNumber(value: string): string | null {
    const digits = sanitizePakistanPhoneDigits(value);
    if (!digits) return 'Phone number is required';
    if (digits.length !== 10) return 'Enter a valid phone number';
    if (!digits.startsWith('3')) return 'Enter a valid mobile number';
    return null;
}
