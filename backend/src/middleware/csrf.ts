import { Request, Response, NextFunction } from 'express';
import { isOriginAllowedForBrowser } from '../config/allowedOrigins';
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    if (req.path.startsWith('/auth/google/callback')) {
        return next();
    }
    const raw = req.headers.origin || req.headers.referer;
    if (process.env.NODE_ENV === 'development' && !raw) {
        return next();
    }
    if (raw) {
        let requestOrigin: string;
        try {
            requestOrigin = /^https?:\/\//i.test(raw) ? new URL(raw).origin : raw;
        }
        catch {
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
