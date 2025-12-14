import express from 'express';
import { getJobs, createJob, updateJob, deleteJob, moveJob, reorderJobs } from '../controllers/jobController';
import { authenticate } from '../middleware/auth';
import { jobLimiter, moveLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.use(authenticate);
router.get('/', getJobs);
router.post('/', jobLimiter, createJob);
router.put('/:id', jobLimiter, updateJob);
router.patch('/:id/move', moveLimiter, moveJob);
router.patch('/reorder', moveLimiter, reorderJobs);
router.delete('/:id', deleteJob);

export default router;

