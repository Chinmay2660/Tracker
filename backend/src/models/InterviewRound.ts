import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewRound extends Document {
  jobId: mongoose.Types.ObjectId;
  stage: string;
  date: Date;
  time?: string;
  endTime?: string;
  notesMarkdown?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}

const InterviewRoundSchema = new Schema<IInterviewRound>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    stage: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String },
    endTime: { type: String },
    notesMarkdown: { type: String },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

InterviewRoundSchema.index({ jobId: 1, date: 1 });

export default mongoose.model<IInterviewRound>('InterviewRound', InterviewRoundSchema);

