export function normalizePhoneDigits(input: string): string {
    if (!input || typeof input !== 'string')
        return '';
    return input.replace(/\D/g, '');
}
export function getNormalizedDigitsForHrContact(contact: {
    phoneNormalized?: string | null;
    phone?: string | null;
}): string {
    const stored = contact.phoneNormalized;
    if (stored != null && String(stored).length > 0) {
        return String(stored);
    }
    return normalizePhoneDigits(contact.phone ?? '');
}
