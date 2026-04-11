/**
 * Browser origins allowed for CORS and CSRF validation.
 *
 * Set on the API host (e.g. Railway, Render, Fly):
 * - FRONTEND_URL=https://ui-tracker.vercel.app  (single app URL), and/or
 * - ALLOWED_ORIGINS=https://ui-tracker.vercel.app,https://www.example.com
 *
 * Optional: ALLOW_VERCEL_PREVIEW_ORIGINS=true allows any https://*.vercel.app (preview deploys).
 */

const DEFAULT_DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:5173'];

function splitOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getAllowedOrigins(): string[] {
  const explicit = splitOrigins(process.env.ALLOWED_ORIGINS || '');
  const primary = (process.env.FRONTEND_URL || '').trim();
  const combined = [...explicit, ...(primary ? [primary] : []), ...DEFAULT_DEV_ORIGINS];
  return [...new Set(combined)];
}

export function isVercelPreviewOrigin(origin: string): boolean {
  if (process.env.ALLOW_VERCEL_PREVIEW_ORIGINS !== 'true') return false;
  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== 'https:') return false;
    return hostname.endsWith('.vercel.app') || hostname === 'vercel.app';
  } catch {
    return false;
  }
}

export function isOriginAllowedForBrowser(origin: string | undefined): boolean {
  if (!origin) return false;
  const allowed = getAllowedOrigins();
  if (allowed.includes(origin)) return true;
  if (isVercelPreviewOrigin(origin)) return true;
  return false;
}
