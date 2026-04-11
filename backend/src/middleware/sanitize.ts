import { Request, Response, NextFunction } from 'express';

/**
 * Strip HTML / XSS patterns from plain strings (Node-safe, no JSDOM/DOMPurify).
 * Avoids ESM/CJS issues on Vercel (jsdom → html-encoding-sniffer → @exodus/bytes).
 */
const sanitizeString = (str: string): string => {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Recursively sanitize an object to prevent XSS attacks
 */
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

/**
 * Express 5 defines `req.query` as a getter-only accessor; assigning to it throws.
 * Replace it with a data property holding the sanitized object.
 */
const setSanitizedQuery = (req: Request, sanitized: ReturnType<typeof sanitizeObject>) => {
  Object.defineProperty(req, 'query', {
    value: sanitized,
    writable: true,
    configurable: true,
    enumerable: true,
  });
};

/**
 * Middleware to sanitize request body, query, and params to prevent XSS attacks
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  setSanitizedQuery(req, sanitizeObject(req.query));
  if (req.params) {
    req.params = sanitizeObject(req.params) as typeof req.params;
  }
  next();
};
