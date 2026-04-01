/**
 * Normalize phone for duplicate detection: digits only.
 * Empty string if no digits (invalid for storage).
 */
export function normalizePhoneDigits(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input.replace(/\D/g, '');
}
