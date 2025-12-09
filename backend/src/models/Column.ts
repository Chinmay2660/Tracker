import mongoose, { Schema, Document } from 'mongoose';

export interface IColumn extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  order: number;
  createdAt: Date;
}

const ColumnSchema = new Schema<IColumn>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

ColumnSchema.index({ userId: 1, order: 1 });

export default mongoose.model<IColumn>('Column', ColumnSchema);

