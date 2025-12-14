import mongoose, { Schema, Document } from 'mongoose';

export interface IStageHistory {
  columnId: mongoose.Types.ObjectId;
  columnTitle?: string;
  enteredDate: Date;
}

export interface IHRContact {
  name?: string;
  phone?: string;
  email?: string;
}

export type InterviewStageStatus = 
  | 'Pending'
  | 'Scheduled'
  | 'Cleared'
  | 'Rejected'
  | 'Shortlisted'
  | 'Pending Results'
  | 'Abandoned by HR'
  | 'Back Off'
  | 'Budget Issue'
  | 'Notice Period Issue'
  | 'No Offer'
  | 'Position Closed'
  | 'Position On Hold'
  | 'Offer Received'
  | 'Offer Accepted'
  | 'Offer Declined';

export interface IInterviewStage {
  stageId: mongoose.Types.ObjectId;
  stageName?: string;
  status: InterviewStageStatus;
  date?: Date;
  order: number;
}

export interface IJob extends Document {
  userId: mongoose.Types.ObjectId;
  columnId: mongoose.Types.ObjectId;
  interviewStages: IInterviewStage[]; // Detailed interview stages with status and date
  companyName: string;
  role: string;
  jobUrl?: string;
  location: string;
  tags: string[];
  // Asked Compensation (CTC Range)
  ctcMin?: number;
  ctcMax?: number;
  // Compensation Breakup
  compensationFixed?: number;
  compensationVariables?: number;
  compensationRSU?: number;
  // Offered Compensation (when stage is Offer)
  offeredCtc?: number;
  offeredCompensationFixed?: number;
  offeredCompensationVariables?: number;
  offeredCompensationRSU?: number;
  resumeVersion?: string;
  notesMarkdown?: string;
  appliedDate?: Date;
  lastWorkingDay?: Date;
  order?: number;
  stageHistory: IStageHistory[];
  hrContacts: IHRContact[];
  createdAt: Date;
  updatedAt: Date;
}

const StageHistorySchema = new Schema<IStageHistory>(
  {
    columnId: { type: Schema.Types.ObjectId, ref: 'Column', required: true },
    columnTitle: { type: String },
    enteredDate: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const HRContactSchema = new Schema<IHRContact>(
  {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
  },
  { _id: false }
);

const InterviewStageSchema = new Schema<IInterviewStage>(
  {
    stageId: { type: Schema.Types.ObjectId, ref: 'Column', required: true },
    stageName: { type: String },
    status: { 
      type: String, 
      enum: [
        'Pending', 'Scheduled', 'Cleared', 'Rejected', 'Shortlisted',
        'Pending Results', 'Abandoned by HR', 'Back Off', 'Budget Issue',
        'Notice Period Issue', 'No Offer', 'Position Closed', 'Position On Hold',
        'Offer Received', 'Offer Accepted', 'Offer Declined'
      ],
      default: 'Pending'
    },
    date: { type: Date },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const JobSchema = new Schema<IJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    columnId: { type: Schema.Types.ObjectId, ref: 'Column', required: true },
    interviewStages: { type: [InterviewStageSchema], default: [] },
    companyName: { type: String, required: true },
    role: { type: String, required: true },
    jobUrl: { type: String },
    location: { type: String, required: true },
    tags: { type: [String], default: [] },
    // Asked Compensation (CTC Range)
    ctcMin: { type: Number },
    ctcMax: { type: Number },
    // Compensation Breakup
    compensationFixed: { type: Number },
    compensationVariables: { type: Number },
    compensationRSU: { type: Number },
    // Offered Compensation (when stage is Offer)
    offeredCtc: { type: Number },
    offeredCompensationFixed: { type: Number },
    offeredCompensationVariables: { type: Number },
    offeredCompensationRSU: { type: Number },
    resumeVersion: { type: String },
    notesMarkdown: { type: String },
    appliedDate: { type: Date },
    lastWorkingDay: { type: Date },
    order: { type: Number, default: 0 },
    stageHistory: { type: [StageHistorySchema], default: [] },
    hrContacts: { type: [HRContactSchema], default: [] },
  },
  { timestamps: true }
);

JobSchema.index({ userId: 1, columnId: 1 });

export default mongoose.model<IJob>('Job', JobSchema);

