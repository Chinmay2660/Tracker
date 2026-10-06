import express from 'express';
import { googleAuth, googleCallback, getMe, logout } from '../controllers/authController';
import {
    loginWithCode,
    registerWithCode,
    regenerateCode,
    exchangeSession,
    createSsoSession,
    loginAsGuest,
} from '../controllers/codeAuthController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// ponytail: OAuth redirects are not brute-force targets — only limit credential posts
router.post('/login', authLimiter, loginWithCode);
router.post('/guest', authLimiter, loginAsGuest);
router.post('/register', authLimiter, registerWithCode);

router.post('/exchange', exchangeSession);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
router.post('/regenerate-code', authenticate, regenerateCode);
router.get('/sso-session', authenticate, createSsoSession);

export default router;
