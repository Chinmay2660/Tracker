import express from 'express';
import { uploadResume, getResumes, deleteResume, upload } from '../controllers/resumeController';
import { authenticate } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.use(authenticate);
router.post('/upload', uploadLimiter, upload.single('file'), uploadResume);
router.get('/', getResumes);
router.delete('/:id', deleteResume);

export default router;

