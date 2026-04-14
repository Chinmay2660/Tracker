import { Request, Response, NextFunction } from 'express';
const sanitizeString = (str: string): string => {
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
};
const sanitizeObject = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeObject(item));
    }
    if (typeof obj === 'object') {
        const sanitized: Record<string, unknown> = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const sanitizedKey = typeof key === 'string' ? sanitizeString(key) : key;
                sanitized[sanitizedKey] = sanitizeObject((obj as Record<string, unknown>)[key]);
            }
        }
        return sanitized;
    }
    return obj;
};
const setSanitizedQuery = (req: Request, sanitized: ReturnType<typeof sanitizeObject>) => {
    Object.defineProperty(req, 'query', {
        value: sanitized,
        writable: true,
        configurable: true,
        enumerable: true,
    });
};
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    setSanitizedQuery(req, sanitizeObject(req.query));
    if (req.params) {
        req.params = sanitizeObject(req.params) as typeof req.params;
    }
    next();
};
