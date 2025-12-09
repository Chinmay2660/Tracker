import mongoose, { Schema, Document } from 'mongoose';

export interface IResumeVersion extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeVersionSchema = new Schema<IResumeVersion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    fileUrl: { type: String, required: true },
  },
  { timestamps: true }
);

ResumeVersionSchema.index({ userId: 1 });

export default mongoose.model<IResumeVersion>('ResumeVersion', ResumeVersionSchema);

