import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import InterviewRound from '../models/InterviewRound';
import Job from '../models/Job';
import { z } from 'zod';

const createInterviewSchema = z.object({
  jobId: z.string(),
  stage: z.string().min(1),
  date: z.string(),
  time: z.string().optional(),
  notesMarkdown: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

const updateInterviewSchema = z.object({
  stage: z.string().min(1).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  notesMarkdown: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

export const createInterview = async (req: AuthRequest, res: Response) => {
  try {
    const data = createInterviewSchema.parse(req.body);

    const job = await Job.findOne({ _id: data.jobId, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const interview = await InterviewRound.create({
      jobId: data.jobId,
      stage: data.stage,
      date: new Date(data.date),
      time: data.time,
      notesMarkdown: data.notesMarkdown,
      status: data.status || 'scheduled',
    });

    res.status(201).json({ success: true, interview });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getJobInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ _id: jobId, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const interviews = await InterviewRound.find({ jobId }).sort({ date: 1 });
    res.json({ success: true, interviews });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateInterviewSchema.parse(req.body);

    const interview = await InterviewRound.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }

    const job = await Job.findOne({ _id: interview.jobId, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const updatedInterview = await InterviewRound.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.json({ success: true, interview: updatedInterview });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const interview = await InterviewRound.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }

    const job = await Job.findOne({ _id: interview.jobId, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    await InterviewRound.findByIdAndDelete(id);
    res.json({ success: true, message: 'Interview deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

