import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a window object for DOMPurify in Node.js environment
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

/**
 * Sanitize a string to prevent XSS attacks
 */
const sanitizeString = (str: string): string => {
  // Remove HTML tags and dangerous content
  const sanitized = purify.sanitize(str, {
    ALLOWED_TAGS: [], // Remove all HTML tags
    ALLOWED_ATTR: [], // Remove all attributes
    KEEP_CONTENT: true, // Keep text content but remove tags
  });
  
  // Additional escape for common XSS patterns
  return sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

/**
 * Recursively sanitize an object to prevent XSS attacks
 */
const sanitizeObject = (obj: any): any => {
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
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Sanitize the key as well
        const sanitizedKey = typeof key === 'string' ? sanitizeString(key) : key;
        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
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
    req.params = sanitizeObject(req.params);
  }
  next();
};

