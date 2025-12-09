import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Job from '../models/Job';
import Column from '../models/Column';
import { z } from 'zod';

const createJobSchema = z.object({
  columnId: z.string(),
  companyName: z.string().min(1),
  role: z.string().min(1),
  jobUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().min(1, 'Location is required'),
  tags: z.array(z.string()).optional(),
  compensationType: z.enum(['fixed', 'range']).optional(),
  compensationMin: z.number().optional(),
  compensationMax: z.number().optional(),
  resumeVersion: z.string().optional(),
  notesMarkdown: z.string().optional(),
  appliedDate: z.string().optional(),
});

const updateJobSchema = z.object({
  columnId: z.string().optional(),
  companyName: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  jobUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().min(1, 'Location is required').optional(),
  tags: z.array(z.string()).optional(),
  compensationType: z.enum(['fixed', 'range']).optional(),
  compensationMin: z.number().optional(),
  compensationMax: z.number().optional(),
  resumeVersion: z.string().optional(),
  notesMarkdown: z.string().optional(),
  appliedDate: z.string().optional(),
});

export const getJobs = async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await Job.find({ userId: req.user._id }).populate('columnId');
    res.json({ success: true, jobs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const data = createJobSchema.parse(req.body);

    const column = await Column.findOne({ _id: data.columnId, userId: req.user._id });
    if (!column) {
      return res.status(404).json({ success: false, error: 'Column not found' });
    }

    const job = await Job.create({
      userId: req.user._id,
      columnId: data.columnId,
      companyName: data.companyName,
      role: data.role,
      jobUrl: data.jobUrl || undefined,
      location: data.location,
      tags: data.tags || [],
      compensationType: data.compensationType,
      compensationMin: data.compensationMin,
      compensationMax: data.compensationMax,
      resumeVersion: data.resumeVersion,
      notesMarkdown: data.notesMarkdown,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : undefined,
    });

    await job.populate('columnId');
    res.status(201).json({ success: true, job });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateJobSchema.parse(req.body);

    if (data.columnId) {
      const column = await Column.findOne({ _id: data.columnId, userId: req.user._id });
      if (!column) {
        return res.status(404).json({ success: false, error: 'Column not found' });
      }
    }

    const updateData: any = { ...data };
    if (data.appliedDate) {
      updateData.appliedDate = new Date(data.appliedDate);
    }
    if (data.jobUrl === '') {
      updateData.jobUrl = undefined;
    }

    const job = await Job.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updateData,
      { new: true }
    ).populate('columnId');

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const job = await Job.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({ success: true, message: 'Job deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const moveJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { columnId } = req.body;

    const column = await Column.findOne({ _id: columnId, userId: req.user._id });
    if (!column) {
      return res.status(404).json({ success: false, error: 'Column not found' });
    }

    const job = await Job.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { columnId },
      { new: true }
    ).populate('columnId');

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

