import { createHmac } from 'crypto';

export const SESSION_COOKIE = 'app-session';
const SESSION_DAYS = 30;

function getSecret(): string {
    const secret = process.env.SESSION_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('SESSION_SECRET is required in production');
    }
    return secret ?? 'dev-only-platform-auth-secret';
}

function signPayload(payload: string): string {
    return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function createSessionToken(userId: string): string {
    const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
    const payload = `${userId}.${expires}`;
    return `${payload}.${signPayload(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): string | null {
    if (!token)
        return null;
    const parts = token.split('.');
    if (parts.length !== 3)
        return null;
    const [userId, expiresStr, signature] = parts;
    const payload = `${userId}.${expiresStr}`;
    if (signature !== signPayload(payload))
        return null;
    const expires = Number(expiresStr);
    if (!userId || !expires || Date.now() > expires)
        return null;
    return userId;
}

export function parseCookies(header: string | undefined): Record<string, string> {
    if (!header)
        return {};
    const out: Record<string, string> = {};
    for (const part of header.split(';')) {
        const trimmed = part.trim();
        if (!trimmed)
            continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1)
            continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim();
        out[key] = decodeURIComponent(value);
    }
    return out;
}

export function sessionCookieOptions() {
    const domain = process.env.COOKIE_DOMAIN?.trim();
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: SESSION_DAYS * 24 * 60 * 60,
        domain: domain || undefined,
    };
}

export function buildSessionCookie(userId: string): string {
    const token = createSessionToken(userId);
    const opts = sessionCookieOptions();
    const parts = [
        `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
        `Path=${opts.path}`,
        `Max-Age=${opts.maxAge}`,
        'HttpOnly',
        `SameSite=${opts.sameSite}`,
    ];
    if (opts.secure)
        parts.push('Secure');
    if (opts.domain)
        parts.push(`Domain=${opts.domain}`);
    return parts.join('; ');
}

export function clearSessionCookie(): string {
    const opts = sessionCookieOptions();
    const parts = [
        `${SESSION_COOKIE}=`,
        `Path=${opts.path}`,
        'Max-Age=0',
        'HttpOnly',
        `SameSite=${opts.sameSite}`,
    ];
    if (opts.domain)
        parts.push(`Domain=${opts.domain}`);
    return parts.join('; ');
}

export function getSessionUserIdFromRequest(cookieHeader: string | undefined): string | null {
    const cookies = parseCookies(cookieHeader);
    return verifySessionToken(cookies[SESSION_COOKIE]);
}
