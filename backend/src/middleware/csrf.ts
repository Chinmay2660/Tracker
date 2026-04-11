import { Request, Response, NextFunction } from 'express';
import { isOriginAllowedForBrowser } from '../config/allowedOrigins';

/**
 * CSRF Protection for API endpoints
 * Since we're using JWT tokens, we validate the Origin/Referer header
 * to ensure requests come from the expected frontend
 */
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF check for OAuth callbacks
  if (req.path.startsWith('/auth/google/callback')) {
    return next();
  }

  const raw = req.headers.origin || req.headers.referer;
  
  // In development, allow requests without origin (e.g., Postman)
  if (process.env.NODE_ENV === 'development' && !raw) {
    return next();
  }

  // Check if origin is allowed (same list as CORS)
  if (raw) {
    let requestOrigin: string;
    try {
      requestOrigin = /^https?:\/\//i.test(raw) ? new URL(raw).origin : raw;
    } catch {
      return res.status(403).json({
        success: false,
        error: 'CSRF validation failed: Invalid origin',
      });
    }
    if (!isOriginAllowedForBrowser(requestOrigin)) {
      return res.status(403).json({
        success: false,
        error: 'CSRF validation failed: Invalid origin',
      });
    }
  }

  next();
};

