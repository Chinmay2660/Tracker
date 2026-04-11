import mongoose, { Schema, Document } from 'mongoose';

export type HrCompanyType =
  | 'consultancy'
  | 'third_party_payroll'
  | 'service_based'
  | 'product_based';

export interface IHrContact extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  /**
   * When companyType is consultancy: HR agency name.
   * When third_party_payroll: payroll provider name.
   */
  intermediaryCompanyName?: string;
  hrName: string;
  phone: string;
  /** Digits-only key for duplicate detection; omitted when phone is empty. */
  phoneNormalized?: string;
  email?: string;
  /** What you told this recruiter about notice period / LWD (e.g. serving notice, 2 months, immediate). */
  noticePeriodLwdNote?: string;
  companyType?: HrCompanyType;
  createdAt: Date;
  updatedAt: Date;
}

const HrContactSchema = new Schema<IHrContact>(
  {
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
  },
  { timestamps: true }
);

HrContactSchema.index({ userId: 1, companyName: 1 });
/** Sparse: multiple contacts without a phone number do not conflict. */
HrContactSchema.index({ userId: 1, phoneNormalized: 1 }, { unique: true, sparse: true });

export default mongoose.model<IHrContact>('HrContact', HrContactSchema);
