import express from 'express';
import { getPublicHrContacts } from '../controllers/hrContactShareController';
import { publicShareLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.get('/hr-contacts/:token', publicShareLimiter, getPublicHrContacts);

export default router;
