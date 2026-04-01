import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import HrContact from '../models/HrContact';
import InterviewRound from '../models/InterviewRound';
import { z } from 'zod';
import { normalizePhoneDigits } from '../utils/phoneNormalize';

const companyTypeEnum = z.enum([
  'consultancy',
  'third_party_payroll',
  'service_based',
  'product_based',
]);

const createHrContactSchema = z.object({
  companyName: z.string().min(1),
  hrName: z.string().min(1),
  phone: z.string().min(1),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  noticePeriodLwdNote: z.string().max(5000).optional(),
  companyType: companyTypeEnum,
});

const updateHrContactSchema = createHrContactSchema.partial();

async function assertUniquePhone(
  userId: string,
  phoneNormalized: string,
  excludeId?: string
): Promise<boolean> {
  if (!phoneNormalized) {
    return false;
  }
  const query: Record<string, unknown> = {
    userId,
    phoneNormalized,
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existing = await HrContact.findOne(query).lean();
  return !existing;
}

export const listHrContacts = async (req: AuthRequest, res: Response) => {
  try {
    const contacts = await HrContact.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, hrContacts: contacts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createHrContact = async (req: AuthRequest, res: Response) => {
  try {
    const data = createHrContactSchema.parse(req.body);
    const phoneNormalized = normalizePhoneDigits(data.phone);
    if (!phoneNormalized) {
      return res.status(400).json({
        success: false,
        error: 'Phone number must contain digits.',
      });
    }
    const isUnique = await assertUniquePhone(req.user._id.toString(), phoneNormalized);
    if (!isUnique) {
      return res.status(409).json({
        success: false,
        error: 'This phone number is already saved for another HR contact.',
      });
    }

    const noticeNote =
      data.noticePeriodLwdNote !== undefined && data.noticePeriodLwdNote.trim() !== ''
        ? data.noticePeriodLwdNote.trim()
        : undefined;

    const hrContact = await HrContact.create({
      userId: req.user._id,
      companyName: data.companyName.trim(),
      hrName: data.hrName.trim(),
      phone: data.phone.trim(),
      phoneNormalized,
      email: data.email?.trim() || undefined,
      noticePeriodLwdNote: noticeNote,
      companyType: data.companyType,
    });

    res.status(201).json({ success: true, hrContact });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'This phone number is already saved for another HR contact.',
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateHrContact = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateHrContactSchema.parse(req.body);

    const existing = await HrContact.findOne({ _id: id, userId: req.user._id });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'HR contact not found' });
    }

    const updatePayload: Record<string, unknown> = {};

    if (data.companyName !== undefined) {
      updatePayload.companyName = data.companyName.trim();
    }
    if (data.hrName !== undefined) {
      updatePayload.hrName = data.hrName.trim();
    }
    if (data.email !== undefined) {
      updatePayload.email = data.email?.trim() || undefined;
    }
    if (data.companyType !== undefined) {
      updatePayload.companyType = data.companyType;
    }
    if (data.noticePeriodLwdNote !== undefined) {
      updatePayload.noticePeriodLwdNote =
        data.noticePeriodLwdNote.trim() === '' ? undefined : data.noticePeriodLwdNote.trim();
    }

    if (data.phone !== undefined) {
      const phoneNormalized = normalizePhoneDigits(data.phone);
      if (!phoneNormalized) {
        return res.status(400).json({
          success: false,
          error: 'Phone number must contain digits.',
        });
      }
      const isUnique = await assertUniquePhone(
        req.user._id.toString(),
        phoneNormalized,
        id
      );
      if (!isUnique) {
        return res.status(409).json({
          success: false,
          error: 'This phone number is already saved for another HR contact.',
        });
      }
      updatePayload.phone = data.phone.trim();
      updatePayload.phoneNormalized = phoneNormalized;
    }

    const hrContact = await HrContact.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true }
    );

    res.json({ success: true, hrContact });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'This phone number is already saved for another HR contact.',
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteHrContact = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await HrContact.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'HR contact not found' });
    }
    await InterviewRound.updateMany({ hrContactId: id }, { $unset: { hrContactId: 1 } });
    res.json({ success: true, message: 'HR contact deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
