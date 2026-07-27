export function normalizePhoneDigits(input: string): string {
    if (!input || typeof input !== 'string')
        return '';
    return input.replace(/\D/g, '');
}

export const PHONE_DIGITS_LENGTH = 10;

export function validatePhoneInput(input: string | undefined): string | null {
    const digits = normalizePhoneDigits(input ?? '');
    if (digits.length === 0)
        return null;
    if (digits.length !== PHONE_DIGITS_LENGTH) {
        return `Phone number must be exactly ${PHONE_DIGITS_LENGTH} digits.`;
    }
    return null;
}

export function isValidPhoneInput(input: string | undefined): boolean {
    return validatePhoneInput(input) === null;
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
export function telHrefFromPhone(phone: string | undefined | null): string | null {
    const digits = normalizePhoneDigits(phone ?? '');
    if (digits.length === 0)
        return null;
    return `tel:${digits}`;
}
const LOOSE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function mailtoHrefFromEmail(email: string | undefined | null): string | null {
    const t = (email ?? '').trim();
    if (!t || !LOOSE_EMAIL.test(t))
        return null;
    return `mailto:${t}`;
}
