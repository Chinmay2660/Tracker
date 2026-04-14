import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import HrContact from '../models/HrContact';
import InterviewRound from '../models/InterviewRound';
import { z } from 'zod';
import { normalizePhoneDigits } from '../utils/phoneNormalize';
import type { Types } from 'mongoose';

/** Legacy rows may have phoneNormalized: "" which breaks sparse uniqueness; remove so empty phones do not collide. */
async function unsetEmptyPhoneNormalized(userId: Types.ObjectId | string): Promise<void> {
  await HrContact.updateMany({ userId, phoneNormalized: '' }, { $unset: { phoneNormalized: 1 } });
}

const companyTypeEnum = z.enum([
  'consultancy',
  'third_party_payroll',
  'service_based',
  'product_based',
]);

type HrBody = {
  companyName?: string;
  intermediaryCompanyName?: string;
  hrName?: string;
  phone?: string;
  email?: string;
  noticePeriodLwdNote?: string;
  companyType?: z.infer<typeof companyTypeEnum>;
};

function trimOrEmpty(s: string | undefined): string {
  return (s ?? '').trim();
}

/** True if at least one meaningful field is filled (phone counts when it has digits). */
export function hrContactHasAtLeastOneField(input: HrBody): boolean {
  if (trimOrEmpty(input.companyName)) return true;
  if (trimOrEmpty(input.intermediaryCompanyName)) return true;
  if (trimOrEmpty(input.hrName)) return true;
  if (normalizePhoneDigits(trimOrEmpty(input.phone))) return true;
  if (trimOrEmpty(input.email)) return true;
  if (trimOrEmpty(input.noticePeriodLwdNote)) return true;
  if (input.companyType !== undefined) return true;
  return false;
}

const optionalCompanyType = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : v),
  companyTypeEnum.optional()
);

const optionalHrFields = {
  companyName: z.string().optional(),
  intermediaryCompanyName: z.string().optional(),
  hrName: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  noticePeriodLwdNote: z.string().max(5000).optional(),
  companyType: optionalCompanyType,
};

const createHrContactSchema = z
  .object(optionalHrFields)
  .superRefine((data, ctx) => {
    if (!hrContactHasAtLeastOneField(data)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one field must be filled.',
      });
    }
  });

const updateHrContactSchema = z.object(optionalHrFields).partial();

async function assertUniquePhone(
  userId: string,
  phoneNormalized: string,
  excludeId?: string
): Promise<boolean> {
  if (!phoneNormalized) {
    return true;
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
    await unsetEmptyPhoneNormalized(req.user._id);
    const phoneNormalized = normalizePhoneDigits(trimOrEmpty(data.phone));

    if (phoneNormalized) {
      const isUnique = await assertUniquePhone(req.user._id.toString(), phoneNormalized);
      if (!isUnique) {
        return res.status(409).json({
          success: false,
          error: 'This phone number is already saved for another HR contact.',
        });
      }
    }

    const noticeNote =
      data.noticePeriodLwdNote !== undefined && trimOrEmpty(data.noticePeriodLwdNote) !== ''
        ? trimOrEmpty(data.noticePeriodLwdNote)
        : undefined;

    const intermediary =
      data.intermediaryCompanyName !== undefined
        ? trimOrEmpty(data.intermediaryCompanyName)
        : undefined;

    const doc: Record<string, unknown> = {
      userId: req.user._id,
      companyName: trimOrEmpty(data.companyName),
      hrName: trimOrEmpty(data.hrName),
      phone: trimOrEmpty(data.phone),
      email: data.email !== undefined ? trimOrEmpty(data.email) || undefined : undefined,
      noticePeriodLwdNote: noticeNote,
      companyType: data.companyType,
    };

    if (data.intermediaryCompanyName !== undefined) {
      doc.intermediaryCompanyName = intermediary === '' ? undefined : intermediary;
    }

    if (phoneNormalized) {
      doc.phoneNormalized = phoneNormalized;
    }

    const hrContact = await HrContact.create(doc);

    res.status(201).json({ success: true, hrContact });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const first = error.issues[0];
      const msg =
        first?.message === 'At least one field must be filled.'
          ? first.message
          : 'Invalid input';
      return res.status(400).json({ success: false, error: msg, details: error.issues });
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
    await unsetEmptyPhoneNormalized(req.user._id);

    const existing = await HrContact.findOne({ _id: id, userId: req.user._id });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'HR contact not found' });
    }

    const merged: HrBody = {
      companyName:
        data.companyName !== undefined ? trimOrEmpty(data.companyName) : existing.companyName,
      intermediaryCompanyName:
        data.intermediaryCompanyName !== undefined
          ? trimOrEmpty(data.intermediaryCompanyName)
          : existing.intermediaryCompanyName ?? '',
      hrName: data.hrName !== undefined ? trimOrEmpty(data.hrName) : existing.hrName,
      phone: data.phone !== undefined ? trimOrEmpty(data.phone) : existing.phone,
      email: data.email !== undefined ? trimOrEmpty(data.email) : existing.email ?? '',
      noticePeriodLwdNote:
        data.noticePeriodLwdNote !== undefined
          ? trimOrEmpty(data.noticePeriodLwdNote)
          : existing.noticePeriodLwdNote ?? '',
      companyType:
        data.companyType !== undefined ? data.companyType : existing.companyType,
    };

    if (!hrContactHasAtLeastOneField(merged)) {
      return res.status(400).json({
        success: false,
        error: 'At least one field must remain filled.',
      });
    }

    const updatePayload: Record<string, unknown> = {};

    if (data.companyName !== undefined) {
      updatePayload.companyName = trimOrEmpty(data.companyName);
    }
    if (data.hrName !== undefined) {
      updatePayload.hrName = trimOrEmpty(data.hrName);
    }
    if (data.email !== undefined) {
      updatePayload.email = trimOrEmpty(data.email) || undefined;
    }
    if (data.companyType !== undefined) {
      updatePayload.companyType = data.companyType;
    }
    if (data.noticePeriodLwdNote !== undefined) {
      updatePayload.noticePeriodLwdNote =
        trimOrEmpty(data.noticePeriodLwdNote) === ''
          ? undefined
          : trimOrEmpty(data.noticePeriodLwdNote);
    }

    const $unset: Record<string, 1> = {};

    if (data.intermediaryCompanyName !== undefined) {
      const t = trimOrEmpty(data.intermediaryCompanyName);
      if (t === '') {
        $unset.intermediaryCompanyName = 1;
      } else {
        updatePayload.intermediaryCompanyName = t;
      }
    }

    const $set: Record<string, unknown> = { ...updatePayload };

    if (data.phone !== undefined) {
      const phoneNormalized = normalizePhoneDigits(trimOrEmpty(data.phone));
      $set.phone = trimOrEmpty(data.phone);
      if (phoneNormalized) {
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
        $set.phoneNormalized = phoneNormalized;
      } else {
        $unset.phoneNormalized = 1;
      }
    }

    const mongoUpdate: { $set?: Record<string, unknown>; $unset?: Record<string, 1> } = {};
    if (Object.keys($set).length > 0) {
      mongoUpdate.$set = $set;
    }
    if (Object.keys($unset).length > 0) {
      mongoUpdate.$unset = $unset;
    }

    if (Object.keys(mongoUpdate).length === 0) {
      return res.json({ success: true, hrContact: existing });
    }

    const hrContact = await HrContact.findByIdAndUpdate(id, mongoUpdate, { new: true });

    res.json({ success: true, hrContact });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.issues });
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
