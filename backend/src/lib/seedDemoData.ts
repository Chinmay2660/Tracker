import mongoose from 'mongoose';
import User from '../models/User';
import Column from '../models/Column';
import Job, { JobSource } from '../models/Job';
import InterviewRound from '../models/InterviewRound';
import HrContact from '../models/HrContact';
import ResumeVersion from '../models/ResumeVersion';
import HrContactShare from '../models/HrContactShare';
import { randomBytes } from 'crypto';
import { hashAuthCode } from './auth';

export const GUEST_USERNAME = 'guest_demo';
// ponytail: unusable placeholder — guest login uses /auth/guest only
const GUEST_AUTH_HASH = hashAuthCode('000000');

// ponytail: minimal valid PDF for resume preview/download in demo mode
const DEMO_PDF = Buffer.from(
    '%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF',
);

const DEFAULT_COLUMNS = [
    { title: 'Applied', color: '#14b8a6' },
    { title: 'Recruiter Call', color: '#3b82f6' },
    { title: 'OA', color: '#8b5cf6' },
    { title: 'Phone Screen', color: '#ec4899' },
    { title: 'Onsite', color: '#f97316' },
    { title: 'Offer', color: '#22c55e' },
];

type DemoJob = {
    company: string;
    role: string;
    location: string;
    column: number;
    tags: string[];
    ctcMin: number;
    ctcMax: number;
    source: JobSource;
    offeredCtc?: number;
};

const DEMO_JOBS: DemoJob[] = [
    { company: 'Google', role: 'Software Engineer L4', location: 'Bangalore', column: 3, tags: ['faang', 'backend'], ctcMin: 45, ctcMax: 55, source: 'referral' },
    { company: 'Stripe', role: 'Backend Engineer', location: 'Remote', column: 2, tags: ['fintech', 'remote'], ctcMin: 40, ctcMax: 50, source: 'linkedin' },
    { company: 'Razorpay', role: 'SDE II', location: 'Bangalore', column: 4, tags: ['fintech', 'startup'], ctcMin: 35, ctcMax: 42, source: 'recruiter' },
    { company: 'Microsoft', role: 'SDE', location: 'Hyderabad', column: 1, tags: ['faang'], ctcMin: 38, ctcMax: 48, source: 'company_site' },
    { company: 'Flipkart', role: 'Senior SDE', location: 'Bangalore', column: 0, tags: ['ecommerce'], ctcMin: 32, ctcMax: 40, source: 'linkedin' },
    { company: 'Atlassian', role: 'Full Stack Engineer', location: 'Remote', column: 2, tags: ['saas', 'remote'], ctcMin: 35, ctcMax: 45, source: 'job_board' },
    { company: 'PhonePe', role: 'Backend Engineer', location: 'Bangalore', column: 0, tags: ['fintech'], ctcMin: 28, ctcMax: 35, source: 'linkedin' },
    { company: 'Uber', role: 'Software Engineer II', location: 'Bangalore', column: 3, tags: ['tech'], ctcMin: 40, ctcMax: 50, source: 'referral' },
    { company: 'Zerodha', role: 'Platform Engineer', location: 'Bangalore', column: 1, tags: ['fintech'], ctcMin: 30, ctcMax: 38, source: 'company_site' },
    { company: 'CRED', role: 'SDE', location: 'Bangalore', column: 5, tags: ['fintech', 'startup'], ctcMin: 35, ctcMax: 45, source: 'referral', offeredCtc: 42 },
    { company: 'Swiggy', role: 'Backend Engineer', location: 'Bangalore', column: 0, tags: ['ecommerce'], ctcMin: 25, ctcMax: 32, source: 'linkedin' },
    { company: 'Freshworks', role: 'Software Engineer', location: 'Chennai', column: 4, tags: ['saas'], ctcMin: 22, ctcMax: 30, source: 'job_board' },
];

const DEMO_HR_CONTACTS = [
    { companyName: 'Google', hrName: 'Sarah Johnson', phone: '+91 98765 43210', email: 'sarah.j@google.com', companyType: 'product_based' as const },
    { companyName: 'Razorpay', hrName: 'Anita Desai', phone: '+91 98765 43211', email: 'anita@razorpay.com', companyType: 'product_based' as const },
    { companyName: 'TCS', hrName: 'Rajesh Kumar', phone: '+91 98765 43212', email: 'rajesh.k@tcs.com', companyType: 'service_based' as const },
    { companyName: 'Infosys', hrName: 'Meera Patel', phone: '+91 98765 43213', email: 'meera.p@infosys.com', companyType: 'service_based' as const },
    { companyName: 'Adecco', hrName: 'Vikram Singh', phone: '+91 98765 43214', email: 'vikram@adecco.com', companyType: 'consultancy' as const },
    { companyName: 'TeamLease', hrName: 'Priya Nair', phone: '+91 98765 43215', email: 'priya@teamlease.com', companyType: 'third_party_payroll' as const },
];

function daysFromNow(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
}

function daysAgo(days: number): Date {
    return daysFromNow(-days);
}

export async function ensureDemoData() {
    let guest = await User.findOne({ username: GUEST_USERNAME });
    if (guest) {
        const columnCount = await Column.countDocuments({ userId: guest._id });
        if (columnCount > 0) return guest;
    }

    if (!guest) {
        guest = await User.create({
            username: GUEST_USERNAME,
            authCodeHash: GUEST_AUTH_HASH,
            name: 'Demo User',
            isGuest: true,
            onboardingComplete: true,
        });
    } else {
        guest.isGuest = true;
        guest.name = 'Demo User';
        guest.authCodeHash = GUEST_AUTH_HASH;
        await guest.save();
    }

    const userId = guest._id;
    const columns = await Column.insertMany(
        DEFAULT_COLUMNS.map((col, i) => ({ userId, title: col.title, order: i, color: col.color })),
    );

    const jobs: mongoose.Document[] = [];

    for (let i = 0; i < DEMO_JOBS.length; i++) {
        const def = DEMO_JOBS[i];
        const column = columns[def.column];
        const appliedDate = daysAgo(30 - i * 2);
        const job = await Job.create({
            userId,
            columnId: column._id,
            companyName: def.company,
            role: def.role,
            location: def.location,
            tags: def.tags,
            ctcMin: def.ctcMin,
            ctcMax: def.ctcMax,
            compensationFixed: def.ctcMin ? def.ctcMin * 0.8 : undefined,
            compensationVariables: def.ctcMin ? def.ctcMin * 0.15 : undefined,
            compensationRSU: def.ctcMin ? def.ctcMin * 0.05 : undefined,
            offeredCtc: def.offeredCtc,
            offeredCompensationFixed: def.offeredCtc ? def.offeredCtc * 0.8 : undefined,
            jobSource: def.source,
            appliedDate,
            nextActionDate: def.column < 5 ? daysFromNow(i % 5) : undefined,
            order: i,
            stageHistory: [{ columnId: columns[0]._id, columnTitle: 'Applied', enteredDate: appliedDate }],
            interviewStages: columns.slice(0, def.column + 1).map((col, idx) => ({
                stageId: col._id,
                stageName: col.title,
                status: idx < def.column ? 'Cleared' : idx === def.column ? 'Scheduled' : 'Pending',
                date: idx === def.column ? daysFromNow(2 + (i % 4)) : idx < def.column ? daysAgo(10 - idx) : undefined,
                order: idx,
            })),
        });
        jobs.push(job);
    }

    const hrContacts = await HrContact.insertMany(
        DEMO_HR_CONTACTS.map((c) => ({
            userId,
            companyName: c.companyName,
            hrName: c.hrName,
            phone: c.phone,
            phoneNormalized: c.phone.replace(/\D/g, ''),
            email: c.email,
            companyType: c.companyType,
            shareable: true,
        })),
    );

    const interviewDefs = [
        { jobIdx: 0, stage: 'Phone Screen', days: 3, time: '10:00', status: 'pending' as const },
        { jobIdx: 0, stage: 'Onsite', days: 10, time: '14:00', status: 'pending' as const },
        { jobIdx: 2, stage: 'Onsite', days: 5, time: '11:00', status: 'pending' as const },
        { jobIdx: 3, stage: 'Recruiter Call', days: 1, time: '15:30', status: 'pending' as const },
        { jobIdx: 4, stage: 'OA', days: 7, time: '09:00', status: 'pending' as const },
        { jobIdx: 6, stage: 'Phone Screen', days: -2, time: '16:00', status: 'completed' as const },
        { jobIdx: 7, stage: 'Phone Screen', days: -5, time: '11:00', status: 'completed' as const },
        { jobIdx: 9, stage: 'Offer', days: -1, time: '12:00', status: 'completed' as const },
        { jobIdx: 1, stage: 'OA', days: 4, time: '10:30', status: 'pending' as const },
        { jobIdx: 11, stage: 'Onsite', days: 8, time: '13:00', status: 'pending' as const },
    ];

    for (const def of interviewDefs) {
        const job = jobs[def.jobIdx] as InstanceType<typeof Job>;
        const hr = hrContacts[def.jobIdx % hrContacts.length];
        await InterviewRound.create({
            jobId: job._id,
            hrContactId: hr._id,
            stage: def.stage,
            date: daysFromNow(def.days),
            time: def.time,
            endTime: def.time.replace(/(\d+):/, (m, h) => `${Number(h) + 1}:`),
            status: def.status,
            notesMarkdown: def.status === 'completed' ? 'Went well — follow up in 2 days' : 'Prepare system design topics',
        });
    }

    await ResumeVersion.insertMany([
        { userId, name: 'Resume — Backend Focus', fileUrl: '/demo/resume-backend.pdf', fileData: DEMO_PDF },
        { userId, name: 'Resume — Full Stack', fileUrl: '/demo/resume-fullstack.pdf', fileData: DEMO_PDF },
        { userId, name: 'Resume — Senior SDE', fileUrl: '/demo/resume-senior.pdf', fileData: DEMO_PDF },
    ]);

    await HrContactShare.findOneAndUpdate(
        { userId },
        { token: randomBytes(16).toString('hex'), enabled: true },
        { upsert: true },
    );

    return guest;
}
