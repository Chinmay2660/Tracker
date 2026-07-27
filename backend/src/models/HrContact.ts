import mongoose, { Schema, Document } from 'mongoose';
export type HrCompanyType = 'consultancy' | 'third_party_payroll' | 'service_based' | 'product_based';
export interface IHrContact extends Document {
    userId: mongoose.Types.ObjectId;
    companyName: string;
    intermediaryCompanyName?: string;
    hrName: string;
    phone: string;
    phoneNormalized?: string;
    email?: string;
    noticePeriodLwdNote?: string;
    companyType?: HrCompanyType;
    shareable: boolean;
    createdAt: Date;
    updatedAt: Date;
}
const HrContactSchema = new Schema<IHrContact>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyName: { type: String, default: '', trim: true },
    intermediaryCompanyName: { type: String, required: false, trim: true },
    hrName: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    phoneNormalized: { type: String, required: false },
    email: { type: String, trim: true },
    noticePeriodLwdNote: { type: String, trim: true },
    companyType: {
        type: String,
        required: false,
        enum: ['consultancy', 'third_party_payroll', 'service_based', 'product_based'],
    },
    shareable: { type: Boolean, default: false },
}, { timestamps: true });
HrContactSchema.index({ userId: 1, companyName: 1 });
HrContactSchema.index({ userId: 1, phoneNormalized: 1 }, { unique: true, sparse: true });
export default mongoose.model<IHrContact>('HrContact', HrContactSchema);
