import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  userId: mongoose.Types.ObjectId;
  columnId: mongoose.Types.ObjectId;
  companyName: string;
  role: string;
  jobUrl?: string;
  location: string;
  tags: string[];
  compensationType?: 'fixed' | 'range';
  compensationMin?: number;
  compensationMax?: number;
  resumeVersion?: string;
  notesMarkdown?: string;
  appliedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    columnId: { type: Schema.Types.ObjectId, ref: 'Column', required: true },
    companyName: { type: String, required: true },
    role: { type: String, required: true },
    jobUrl: { type: String },
    location: { type: String, required: true },
    tags: { type: [String], default: [] },
    compensationType: { type: String, enum: ['fixed', 'range'] },
    compensationMin: { type: Number },
    compensationMax: { type: Number },
    resumeVersion: { type: String },
    notesMarkdown: { type: String },
    appliedDate: { type: Date },
  },
  { timestamps: true }
);

JobSchema.index({ userId: 1, columnId: 1 });

export default mongoose.model<IJob>('Job', JobSchema);

