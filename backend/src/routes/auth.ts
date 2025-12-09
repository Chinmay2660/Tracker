import express from 'express';
import { googleAuth, googleCallback, getMe, logout } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;

