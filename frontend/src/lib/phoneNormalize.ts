/** Digits only — matches backend duplicate detection. */
export function normalizePhoneDigits(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/\D/g, '');
}

/**
 * Effective digits for duplicate checks. Treats stored `phoneNormalized` of `""` as missing
 * (legacy bad data) so it falls back to digits from `phone`.
 */
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
