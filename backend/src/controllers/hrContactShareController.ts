import crypto from 'crypto';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import HrContact, { IHrContact } from '../models/HrContact';
import HrContactShare from '../models/HrContactShare';
import { Request } from 'express';

const HR_CONTACT_LIST_SORT = { companyName: 1 as const, createdAt: -1 as const };

function generateShareToken(): string {
    return crypto.randomBytes(24).toString('base64url');
}

function buildShareUrl(token: string): string {
    const base = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    return `${base}/share/hr-contacts/${token}`;
}

function toPublicContact(doc: IHrContact) {
    return {
        companyName: doc.companyName ?? '',
        intermediaryCompanyName: doc.intermediaryCompanyName,
        hrName: doc.hrName ?? '',
        phone: doc.phone ?? '',
        email: doc.email,
        noticePeriodLwdNote: doc.noticePeriodLwdNote,
        companyType: doc.companyType,
    };
}

export const getHrContactShare = async (req: AuthRequest, res: Response) => {
    try {
        const share = await HrContactShare.findOne({ userId: req.user._id }).lean();
        if (!share || !share.enabled) {
            return res.json({
                success: true,
                share: { enabled: false },
            });
        }
        return res.json({
            success: true,
            share: {
                enabled: true,
                token: share.token,
                shareUrl: buildShareUrl(share.token),
            },
        });
    }
    catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load share settings';
        res.status(500).json({ success: false, error: message });
    }
};

export const enableHrContactShare = async (req: AuthRequest, res: Response) => {
    try {
        let share = await HrContactShare.findOne({ userId: req.user._id });
        if (share) {
            share.enabled = true;
            await share.save();
        }
        else {
            share = await HrContactShare.create({
                userId: req.user._id,
                token: generateShareToken(),
                enabled: true,
            });
        }
        return res.json({
            success: true,
            share: {
                enabled: true,
                token: share.token,
                shareUrl: buildShareUrl(share.token),
            },
        });
    }
    catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create share link';
        res.status(500).json({ success: false, error: message });
    }
};

export const revokeHrContactShare = async (req: AuthRequest, res: Response) => {
    try {
        const share = await HrContactShare.findOne({ userId: req.user._id });
        if (!share) {
            return res.json({ success: true, share: { enabled: false } });
        }
        share.enabled = false;
        await share.save();
        return res.json({ success: true, share: { enabled: false } });
    }
    catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to revoke share link';
        res.status(500).json({ success: false, error: message });
    }
};

export const getPublicHrContacts = async (req: Request, res: Response) => {
    try {
        const token = String(req.params.token ?? '').trim();
        if (!token) {
            return res.status(404).json({ success: false, error: 'Share link not found' });
        }
        const share = await HrContactShare.findOne({ token, enabled: true }).lean();
        if (!share) {
            return res.status(404).json({ success: false, error: 'Share link not found or disabled' });
        }
        const contacts = await HrContact.find({ userId: share.userId, shareable: true })
            .sort(HR_CONTACT_LIST_SORT)
            .lean();
        return res.json({
            success: true,
            hrContacts: contacts.map((c) => toPublicContact(c)),
            total: contacts.length,
        });
    }
    catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load shared contacts';
        res.status(500).json({ success: false, error: message });
    }
};
