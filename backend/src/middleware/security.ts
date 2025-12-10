import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Configure Helmet for security headers
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React
      scriptSrc: ["'self'"], // Only allow scripts from same origin
      imgSrc: ["'self'", "data:", "https:"], // Allow images from same origin, data URIs, and HTTPS
      connectSrc: ["'self'"], // Only allow connections to same origin
      fontSrc: ["'self'", "data:"], // Allow fonts from same origin and data URIs
      objectSrc: ["'none'"], // Disallow object, embed, and applet elements
      mediaSrc: ["'self'"], // Allow media from same origin
      frameSrc: ["'none'"], // Disallow iframes
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API compatibility
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true, // Prevent MIME type sniffing
  xssFilter: true, // Enable XSS filter
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

/**
 * Additional security headers middleware
 */
export const additionalSecurityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  
  next();
};

/**
 * Validate and sanitize request size
 */
export const validateRequestSize = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const contentLength = req.headers['content-length'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Request entity too large',
    });
  }

  next();
};

