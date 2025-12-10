import { Request, Response, NextFunction } from 'express';

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

  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
  ];

  const origin = req.headers.origin || req.headers.referer;
  
  // In development, allow requests without origin (e.g., Postman)
  if (process.env.NODE_ENV === 'development' && !origin) {
    return next();
  }

  // Check if origin is allowed
  if (origin) {
    const originUrl = new URL(origin);
    const isAllowed = allowedOrigins.some((allowed) => {
      try {
        const allowedUrl = new URL(allowed);
        return originUrl.origin === allowedUrl.origin;
      } catch {
        return false;
      }
    });

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        error: 'CSRF validation failed: Invalid origin',
      });
    }
  }

  next();
};

