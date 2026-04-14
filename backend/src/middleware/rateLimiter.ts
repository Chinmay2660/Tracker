import rateLimit from 'express-rate-limit';
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: 'Too many file uploads, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
export const jobLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        success: false,
        error: 'Too many job operations, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
export const moveLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: {
        success: false,
        error: 'Too many move operations, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
