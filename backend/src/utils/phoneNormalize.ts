export function normalizePhoneDigits(input: string): string {
    if (!input || typeof input !== 'string') {
        return '';
    }
    return input.replace(/\D/g, '');
}
