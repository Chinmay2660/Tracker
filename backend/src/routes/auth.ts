import express from 'express';
import { googleAuth, googleCallback, getMe, logout } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Apply strict rate limiting to authentication endpoints
router.use(authLimiter);

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;

