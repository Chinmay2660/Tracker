export function getApiBaseUrl(): string {
    const raw = import.meta.env.VITE_API_URL;
    const base = typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : 'http://localhost:8000';
    return base.replace(/\/$/, '');
}
