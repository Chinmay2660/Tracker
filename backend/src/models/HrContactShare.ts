import mongoose, { Schema, Document } from 'mongoose';

export interface IHrContactShare extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const HrContactShareSchema = new Schema<IHrContactShare>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    enabled: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IHrContactShare>('HrContactShare', HrContactShareSchema);
