import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const CODE_SALT_LEN = 16;

export function generateAuthCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
}

export function normalizeUsername(username: string): string {
    return username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
}

export function isValidUsername(username: string): boolean {
    return /^[a-z0-9_]{3,20}$/.test(username);
}

export function isValidAuthCode(code: string): boolean {
    return /^\d{6}$/.test(code);
}

export function hashAuthCode(code: string): string {
    const salt = randomBytes(CODE_SALT_LEN);
    const hash = scryptSync(code, salt, 32);
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyAuthCode(code: string, stored: string): boolean {
    const [saltHex, hashHex] = stored.split(':');
    if (!saltHex || !hashHex)
        return false;
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const actual = scryptSync(code, salt, 32);
    return timingSafeEqual(expected, actual);
}

export async function uniqueUsername(base: string, exists: (username: string) => Promise<boolean>): Promise<string> {
    const normalized = normalizeUsername(base).slice(0, 20) || 'user';
    if (!await exists(normalized))
        return normalized;
    for (let i = 1; i < 1000; i++) {
        const candidate = `${normalized.slice(0, 17)}_${i}`;
        if (!await exists(candidate))
            return candidate;
    }
    return `${normalized.slice(0, 12)}_${Date.now().toString(36)}`;
}
