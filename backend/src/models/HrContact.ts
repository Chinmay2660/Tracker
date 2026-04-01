import mongoose, { Schema, Document } from 'mongoose';

export type HrCompanyType =
  | 'consultancy'
  | 'third_party_payroll'
  | 'service_based'
  | 'product_based';

export interface IHrContact extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  hrName: string;
  phone: string;
  phoneNormalized: string;
  email?: string;
  /** What you told this recruiter about notice period / LWD (e.g. serving notice, 2 months, immediate). */
  noticePeriodLwdNote?: string;
  companyType: HrCompanyType;
  createdAt: Date;
  updatedAt: Date;
}

const HrContactSchema = new Schema<IHrContact>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyName: { type: String, required: true, trim: true },
    hrName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    phoneNormalized: { type: String, required: true },
    email: { type: String, trim: true },
    noticePeriodLwdNote: { type: String, trim: true },
    companyType: {
      type: String,
      required: true,
      enum: ['consultancy', 'third_party_payroll', 'service_based', 'product_based'],
    },
  },
  { timestamps: true }
);

HrContactSchema.index({ userId: 1, companyName: 1 });
HrContactSchema.index({ userId: 1, phoneNormalized: 1 }, { unique: true });

export default mongoose.model<IHrContact>('HrContact', HrContactSchema);
