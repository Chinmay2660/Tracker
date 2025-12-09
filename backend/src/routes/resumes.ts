import express from 'express';
import { uploadResume, getResumes, deleteResume, upload } from '../controllers/resumeController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.post('/upload', upload.single('file'), uploadResume);
router.get('/', getResumes);
router.delete('/:id', deleteResume);

export default router;

