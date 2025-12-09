import express from 'express';
import {
  createInterview,
  getJobInterviews,
  updateInterview,
  deleteInterview,
} from '../controllers/interviewController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.post('/', createInterview);
router.get('/jobs/:jobId', getJobInterviews);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);

export default router;

