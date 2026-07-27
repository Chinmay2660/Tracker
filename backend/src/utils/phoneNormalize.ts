export function normalizePhoneDigits(input: string): string {
    if (!input || typeof input !== 'string') {
        return '';
    }
    return input.replace(/\D/g, '');
}

export const PHONE_DIGITS_LENGTH = 10;

export function validatePhoneInput(input: string | undefined): string | null {
    const digits = normalizePhoneDigits(input ?? '');
    if (digits.length === 0) {
        return null;
    }
    if (digits.length !== PHONE_DIGITS_LENGTH) {
        return `Phone number must be exactly ${PHONE_DIGITS_LENGTH} digits.`;
    }
    return null;
}

export function isValidPhoneInput(input: string | undefined): boolean {
    return validatePhoneInput(input) === null;
}
