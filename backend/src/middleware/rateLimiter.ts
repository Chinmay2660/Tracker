import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

const AUTH_POST_PATHS = ['/auth/login', '/auth/register', '/auth/guest'];

const limiterDefaults = {
    standardHeaders: true,
    legacyHeaders: false,
};

function isRateLimitEnabled(): boolean {
    return process.env.RATE_LIMIT_ENABLED === 'true';
}

function isAuthRateLimitEnabled(): boolean {
    if (process.env.AUTH_RATE_LIMIT_ENABLED !== undefined) {
        return process.env.AUTH_RATE_LIMIT_ENABLED === 'true';
    }
    return isRateLimitEnabled();
}

function shouldSkipApiLimit(req: Request): boolean {
    if (!isRateLimitEnabled()) return true;
    const path = req.path;
    if (path === '/health' || path === '/') return true;
    // Session checks and OAuth redirects — not abuse vectors
    if (
        path === '/auth/me'
        || path === '/auth/google'
        || path === '/auth/google/callback'
        || path === '/auth/exchange'
    ) {
        return true;
    }
    // Credential posts use authLimiter only (avoid double-counting)
    if (req.method === 'POST' && AUTH_POST_PATHS.includes(path)) {
        return true;
    }
    return false;
}

function shouldSkipAuthLimit(_req: Request): boolean {
    return !isAuthRateLimitEnabled();
}

export const apiLimiter = rateLimit({
    ...limiterDefaults,
    windowMs: 15 * 60 * 1000,
    max: 300,
    skip: shouldSkipApiLimit,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
    },
});

export const authLimiter = rateLimit({
    ...limiterDefaults,
    windowMs: 15 * 60 * 1000,
    max: 30,
    skip: shouldSkipAuthLimit,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.',
    },
});

export const uploadLimiter = rateLimit({
    ...limiterDefaults,
    skip: (_req) => !isRateLimitEnabled(),
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: 'Too many file uploads, please try again later.',
    },
});

export const jobLimiter = rateLimit({
    ...limiterDefaults,
    skip: (_req) => !isRateLimitEnabled(),
    max: 50,
    message: {
        success: false,
        error: 'Too many job operations, please try again later.',
    },
});

export const moveLimiter = rateLimit({
    ...limiterDefaults,
    skip: (_req) => !isRateLimitEnabled(),
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: {
        success: false,
        error: 'Too many move operations, please try again later.',
    },
});

export const publicShareLimiter = rateLimit({
    ...limiterDefaults,
    skip: (_req) => !isRateLimitEnabled(),
    max: 60,
    message: {
        success: false,
        error: 'Too many requests, please try again later.',
    },
});
