import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import InterviewRound from '../models/InterviewRound';
import Job from '../models/Job';
import HrContact from '../models/HrContact';
import { z } from 'zod';

const createInterviewSchema = z.object({
  jobId: z.string(),
  hrContactId: z.string().optional(),
  stage: z.string().min(1),
  date: z.string(),
  time: z.string().optional(),
  endTime: z.string().optional(),
  notesMarkdown: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
});

const updateInterviewSchema = z.object({
  hrContactId: z.union([z.string(), z.literal(''), z.null()]).optional(),
  stage: z.string().min(1).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  endTime: z.string().optional(),
  notesMarkdown: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
});

export const createInterview = async (req: AuthRequest, res: Response) => {
  try {
    const data = createInterviewSchema.parse(req.body);

    const job = await Job.findOne({ _id: data.jobId, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    let hrContactId: string | undefined;
    if (data.hrContactId) {
      const hr = await HrContact.findOne({ _id: data.hrContactId, userId: req.user._id });
      if (!hr) {
        return res.status(400).json({ success: false, error: 'HR contact not found' });
      }
      hrContactId = data.hrContactId;
    }

    const interview = await InterviewRound.create({
      jobId: data.jobId,
      ...(hrContactId ? { hrContactId } : {}),
      stage: data.stage,
      date: new Date(data.date),
      time: data.time,
      endTime: data.endTime,
      notesMarkdown: data.notesMarkdown,
      status: data.status || 'pending',
    });

    const populated = await InterviewRound.findById(interview._id).populate(
      'hrContactId',
      'companyName intermediaryCompanyName hrName phone email companyType noticePeriodLwdNote'
    );

    res.status(201).json({ success: true, interview: populated });
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

    const interviews = await InterviewRound.find({ jobId })
      .populate('hrContactId', 'companyName intermediaryCompanyName hrName phone email companyType noticePeriodLwdNote')
      .sort({ date: 1 });
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

    const updateData: any = {};
    
    // Only update fields that are provided
    if (data.stage !== undefined) {
      updateData.stage = data.stage;
    }
    if (data.date !== undefined) {
      updateData.date = new Date(data.date);
    }
    if (data.time !== undefined) {
      updateData.time = data.time || undefined;
    }
    if (data.endTime !== undefined) {
      updateData.endTime = data.endTime || undefined;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.notesMarkdown !== undefined) {
      updateData.notesMarkdown = data.notesMarkdown || undefined;
    }
    let unsetHrContact = false;
    if (data.hrContactId !== undefined) {
      if (data.hrContactId === '' || data.hrContactId === null) {
        unsetHrContact = true;
      } else {
        const hr = await HrContact.findOne({ _id: data.hrContactId, userId: req.user._id });
        if (!hr) {
          return res.status(400).json({ success: false, error: 'HR contact not found' });
        }
        updateData.hrContactId = data.hrContactId;
      }
    }

    const mongoUpdate: { $set?: typeof updateData; $unset?: { hrContactId: 1 } } = {};
    if (Object.keys(updateData).length > 0) {
      mongoUpdate.$set = updateData;
    }
    if (unsetHrContact) {
      mongoUpdate.$unset = { hrContactId: 1 };
    }

    const updatedInterview = await InterviewRound.findByIdAndUpdate(
      id,
      mongoUpdate,
      { new: true }
    ).populate('hrContactId', 'companyName intermediaryCompanyName hrName phone email companyType noticePeriodLwdNote');

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

