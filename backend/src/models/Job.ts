import mongoose, { Schema, Document } from 'mongoose';

export interface IStageHistory {
  columnId: mongoose.Types.ObjectId;
  columnTitle?: string;
  enteredDate: Date;
}

export interface IJob extends Document {
  userId: mongoose.Types.ObjectId;
  columnId: mongoose.Types.ObjectId;
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
  offeredCtcMin?: number;
  offeredCtcMax?: number;
  offeredCompensationFixed?: number;
  offeredCompensationVariables?: number;
  offeredCompensationRSU?: number;
  resumeVersion?: string;
  notesMarkdown?: string;
  appliedDate?: Date;
  lastWorkingDay?: Date;
  stageHistory: IStageHistory[];
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

const JobSchema = new Schema<IJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    columnId: { type: Schema.Types.ObjectId, ref: 'Column', required: true },
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
    offeredCtcMin: { type: Number },
    offeredCtcMax: { type: Number },
    offeredCompensationFixed: { type: Number },
    offeredCompensationVariables: { type: Number },
    offeredCompensationRSU: { type: Number },
    resumeVersion: { type: String },
    notesMarkdown: { type: String },
    appliedDate: { type: Date },
    lastWorkingDay: { type: Date },
    stageHistory: { type: [StageHistorySchema], default: [] },
  },
  { timestamps: true }
);

JobSchema.index({ userId: 1, columnId: 1 });

export default mongoose.model<IJob>('Job', JobSchema);

