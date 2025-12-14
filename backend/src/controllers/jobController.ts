import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Job from '../models/Job';
import Column from '../models/Column';
import { z } from 'zod';

const hrContactSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

const interviewStageSchema = z.object({
  stageId: z.string(),
  stageName: z.string().optional(),
  status: z.enum([
    'Pending', 'Scheduled', 'Cleared', 'Rejected', 'Shortlisted',
    'Pending Results', 'Abandoned by HR', 'Back Off', 'Budget Issue',
    'Notice Period Issue', 'No Offer', 'Position Closed', 'Position On Hold',
    'Offer Received', 'Offer Accepted', 'Offer Declined'
  ]).default('Pending'),
  date: z.string().optional(),
  order: z.number(),
});

const createJobSchema = z.object({
  columnId: z.string(),
  interviewStages: z.array(interviewStageSchema).optional(),
  companyName: z.string().min(1),
  role: z.string().min(1),
  jobUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().min(1, 'Location is required'),
  tags: z.array(z.string()).optional(),
  // Asked Compensation
  ctcMin: z.number().optional(),
  ctcMax: z.number().optional(),
  compensationFixed: z.number().optional(),
  compensationVariables: z.number().optional(),
  compensationRSU: z.number().optional(),
  // Offered Compensation
  offeredCtc: z.number().optional(),
  offeredCompensationFixed: z.number().optional(),
  offeredCompensationVariables: z.number().optional(),
  offeredCompensationRSU: z.number().optional(),
  resumeVersion: z.string().optional(),
  notesMarkdown: z.string().optional(),
  appliedDate: z.string().optional(),
  lastWorkingDay: z.string().optional(),
  hrContacts: z.array(hrContactSchema).optional(),
});

const updateJobSchema = z.object({
  columnId: z.string().optional(),
  interviewStages: z.array(interviewStageSchema).optional(),
  companyName: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  jobUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().min(1, 'Location is required').optional(),
  tags: z.array(z.string()).optional(),
  // Asked Compensation
  ctcMin: z.number().optional(),
  ctcMax: z.number().optional(),
  compensationFixed: z.number().optional(),
  compensationVariables: z.number().optional(),
  compensationRSU: z.number().optional(),
  // Offered Compensation
  offeredCtc: z.number().optional(),
  offeredCompensationFixed: z.number().optional(),
  offeredCompensationVariables: z.number().optional(),
  offeredCompensationRSU: z.number().optional(),
  resumeVersion: z.string().optional(),
  notesMarkdown: z.string().optional(),
  appliedDate: z.string().optional(),
  lastWorkingDay: z.string().optional(),
  hrContacts: z.array(hrContactSchema).optional(),
});

export const getJobs = async (req: AuthRequest, res: Response) => {
  try {
    // Don't populate columnId - return just the ID string for consistency
    const jobs = await Job.find({ userId: req.user._id })
      .select('-__v')
      .sort({ order: 1, updatedAt: -1 });
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

    const appliedDate = data.appliedDate ? new Date(data.appliedDate) : undefined;
    // If column is "Applied" and appliedDate is provided, use appliedDate for stageHistory
    const isAppliedStage = column.title.toLowerCase() === 'applied';
    const initialStageDate = isAppliedStage && appliedDate ? appliedDate : new Date();

    // Get max order in the column and set new order
    const maxOrderJob = await Job.findOne({ columnId: data.columnId, userId: req.user._id })
      .sort({ order: -1 })
      .limit(1);
    const newOrder = maxOrderJob && maxOrderJob.order !== undefined ? (maxOrderJob.order + 1) : 0;

    // Process interview stages - convert date strings to Date objects
    const interviewStages = (data.interviewStages || []).map(stage => ({
      ...stage,
      date: stage.date ? new Date(stage.date) : undefined,
    }));

    // If no interview stages provided, create a default one for the current column
    const defaultInterviewStages = interviewStages.length > 0 ? interviewStages : [{
      stageId: data.columnId,
      stageName: column.title,
      status: 'Pending' as const,
      date: appliedDate || new Date(),
      order: 0,
    }];

    const job = await Job.create({
      userId: req.user._id,
      columnId: data.columnId,
      interviewStages: defaultInterviewStages,
      companyName: data.companyName,
      role: data.role,
      jobUrl: data.jobUrl || undefined,
      location: data.location,
      tags: data.tags || [],
      ctcMin: data.ctcMin,
      ctcMax: data.ctcMax,
      compensationFixed: data.compensationFixed,
      compensationVariables: data.compensationVariables,
      compensationRSU: data.compensationRSU,
      offeredCtc: data.offeredCtc,
      offeredCompensationFixed: data.offeredCompensationFixed,
      offeredCompensationVariables: data.offeredCompensationVariables,
      offeredCompensationRSU: data.offeredCompensationRSU,
      resumeVersion: data.resumeVersion,
      notesMarkdown: data.notesMarkdown,
      appliedDate: appliedDate,
      order: newOrder,
      stageHistory: [{
        columnId: data.columnId,
        columnTitle: column.title,
        enteredDate: initialStageDate,
      }],
      hrContacts: data.hrContacts || [],
    });

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

    const job = await Job.findOne({ _id: id, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const updateData: any = {};
    
    // Copy all non-columnId fields
    Object.keys(data).forEach((key) => {
      if (key !== 'columnId') {
        updateData[key] = data[key as keyof typeof data];
      }
    });

    const newAppliedDate = data.appliedDate ? new Date(data.appliedDate) : undefined;
    if (newAppliedDate) {
      updateData.appliedDate = newAppliedDate;
    }
    if (data.lastWorkingDay !== undefined) {
      if (data.lastWorkingDay) {
        updateData.lastWorkingDay = new Date(data.lastWorkingDay);
      } else {
        updateData.lastWorkingDay = undefined;
      }
    }
    if (updateData.jobUrl === '') {
      updateData.jobUrl = undefined;
    }

    // Track stage change if columnId is being updated
    if (data.columnId && data.columnId !== job.columnId.toString()) {
      const column = await Column.findOne({ _id: data.columnId, userId: req.user._id });
      if (!column) {
        return res.status(404).json({ success: false, error: 'Column not found' });
      }

      updateData.columnId = data.columnId;

      // Check if this stage already exists in history
      const existingStageIndex = job.stageHistory.findIndex(
        (stage) => stage.columnId.toString() === data.columnId
      );

      const stageHistory = [...(job.stageHistory || [])];
      const isAppliedStage = column.title.toLowerCase() === 'applied';
      // If moving to "Applied" stage and appliedDate is provided, use appliedDate
      const stageEntryDate = isAppliedStage && newAppliedDate ? newAppliedDate : new Date();

      if (existingStageIndex === -1) {
        // New stage - add to history
        stageHistory.push({
          columnId: data.columnId as any,
          columnTitle: column.title,
          enteredDate: stageEntryDate,
        });
      } else {
        // Stage already visited - update the entry date
        stageHistory[existingStageIndex] = {
          ...stageHistory[existingStageIndex],
          enteredDate: stageEntryDate,
          columnTitle: column.title,
        };
      }

      updateData.stageHistory = stageHistory;
    } else if (newAppliedDate) {
      // If appliedDate is being updated and job is in "Applied" stage, update the stageHistory
      const currentColumn = await Column.findOne({ _id: job.columnId, userId: req.user._id });
      if (currentColumn && currentColumn.title.toLowerCase() === 'applied') {
        const stageHistory = [...(job.stageHistory || [])];
        const appliedStageIndex = stageHistory.findIndex(
          (stage) => stage.columnId.toString() === job.columnId.toString()
        );
        
        if (appliedStageIndex !== -1) {
          stageHistory[appliedStageIndex] = {
            ...stageHistory[appliedStageIndex],
            enteredDate: newAppliedDate,
          };
          updateData.stageHistory = stageHistory;
        }
      }
    }

    const updatedJob = await Job.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updateData,
      { new: true }
    );

    res.json({ success: true, job: updatedJob });
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
    const job = await Job.findOne({ _id: id, userId: req.user._id });

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Delete all related interviews
    const InterviewRound = (await import('../models/InterviewRound')).default;
    await InterviewRound.deleteMany({ jobId: id });

    // Delete the job
    await Job.findByIdAndDelete(id);

    res.json({ success: true, message: 'Job and all related interviews deleted' });
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

    const job = await Job.findOne({ _id: id, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Check if this stage already exists in history
    const existingStageIndex = job.stageHistory.findIndex(
      (stage) => stage.columnId.toString() === columnId
    );

    const stageHistory = [...(job.stageHistory || [])];
    const isAppliedStage = column.title.toLowerCase() === 'applied';
    // If moving to "Applied" stage and appliedDate exists, use appliedDate
    const stageEntryDate = isAppliedStage && job.appliedDate ? job.appliedDate : new Date();

    if (existingStageIndex === -1) {
      // New stage - add to history
      stageHistory.push({
        columnId: columnId as any,
        columnTitle: column.title,
        enteredDate: stageEntryDate,
      });
    } else {
      // Stage already visited - update the entry date
      stageHistory[existingStageIndex] = {
        ...stageHistory[existingStageIndex],
        enteredDate: stageEntryDate,
        columnTitle: column.title,
      };
    }

    // Get max order in the target column and set new order
    const maxOrderJob = await Job.findOne({ columnId, userId: req.user._id })
      .sort({ order: -1 })
      .limit(1);
    const newOrder = maxOrderJob && maxOrderJob.order !== undefined ? (maxOrderJob.order + 1) : 0;

    // Update interviewStages to include the new column if not already there
    const currentInterviewStages = job.interviewStages || [];
    const stageExists = currentInterviewStages.some(s => s.stageId.toString() === columnId);
    
    let interviewStages = currentInterviewStages;
    if (!stageExists) {
      const maxStageOrder = Math.max(...currentInterviewStages.map(s => s.order), -1);
      interviewStages = [...currentInterviewStages, {
        stageId: columnId as any,
        stageName: column.title,
        status: 'Pending' as const,
        date: new Date(),
        order: maxStageOrder + 1,
      }];
    }

    const updatedJob = await Job.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { columnId, stageHistory, order: newOrder, interviewStages },
      { new: true }
    );

    res.json({ success: true, job: updatedJob });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const reorderJobs = async (req: AuthRequest, res: Response) => {
  try {
    const { jobIds } = req.body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ success: false, error: 'jobIds array is required' });
    }

    // Verify all jobs belong to the user and get their columnId
    const jobs = await Job.find({ _id: { $in: jobIds }, userId: req.user._id });
    
    if (jobs.length !== jobIds.length) {
      return res.status(404).json({ success: false, error: 'Some jobs not found' });
    }

    // Verify all jobs are in the same column
    const columnIds = [...new Set(jobs.map(job => job.columnId.toString()))];
    if (columnIds.length > 1) {
      return res.status(400).json({ success: false, error: 'All jobs must be in the same column' });
    }

    // Update order for all jobs
    const updatePromises = jobIds.map((jobId: string, index: number) =>
      Job.findOneAndUpdate(
        { _id: jobId, userId: req.user._id },
        { order: index },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

