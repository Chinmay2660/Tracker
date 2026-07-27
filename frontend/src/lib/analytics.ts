import { differenceInDays } from 'date-fns';
import { Column, InterviewStageStatus, Job, ResumeVersion } from '../types';

const REJECTION_STATUSES: InterviewStageStatus[] = [
    'Rejected', 'Abandoned by HR', 'Back Off', 'Budget Issue',
    'Notice Period Issue', 'No Offer', 'Position Closed', 'Offer Declined',
];

export interface FunnelStage {
    name: string;
    count: number;
    conversionRate: number;
    avgDays: number | null;
    color?: string;
}

export function buildFunnelData(jobs: Job[], columns: Column[]): FunnelStage[] {
    const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
    const total = jobs.length || 1;

    return sortedColumns.map((column, idx) => {
        const jobsInStage = jobs.filter((job) =>
            (job.interviewStages ?? []).some((s) => s.stageId === column._id),
        );
        const count = jobsInStage.length;

        let avgDays: number | null = null;
        const dayCounts: number[] = [];
        jobsInStage.forEach((job) => {
            const entry = (job.stageHistory ?? []).find((h) => h.columnId === column._id);
            if (!entry) return;
            const entered = new Date(entry.enteredDate);
            const nextHistory = (job.stageHistory ?? [])
                .filter((h) => new Date(h.enteredDate) > entered)
                .sort((a, b) => new Date(a.enteredDate).getTime() - new Date(b.enteredDate).getTime())[0];
            const end = nextHistory ? new Date(nextHistory.enteredDate) : new Date();
            dayCounts.push(Math.max(0, differenceInDays(end, entered)));
        });
        if (dayCounts.length > 0) {
            avgDays = Math.round(dayCounts.reduce((a, b) => a + b, 0) / dayCounts.length);
        }

        const prevCount = idx === 0 ? total : sortedColumns.slice(0, idx).reduce((max, col) => {
            const c = jobs.filter((j) => (j.interviewStages ?? []).some((s) => s.stageId === col._id)).length;
            return Math.max(max, c);
        }, 0);

        return {
            name: column.title,
            count,
            conversionRate: prevCount > 0 ? Math.round((count / prevCount) * 100) : 0,
            avgDays,
            color: column.color,
        };
    });
}

export interface RejectionInsight {
    stage: string;
    company: string;
    status: string;
}

export function buildRejectionInsights(jobs: Job[]): { byStatus: Record<string, number>; byCompany: Record<string, number>; items: RejectionInsight[] } {
    const byStatus: Record<string, number> = {};
    const byCompany: Record<string, number> = {};
    const items: RejectionInsight[] = [];

    jobs.forEach((job) => {
        (job.interviewStages ?? []).forEach((stage) => {
            if (!REJECTION_STATUSES.includes(stage.status)) return;
            byStatus[stage.status] = (byStatus[stage.status] ?? 0) + 1;
            byCompany[job.companyName] = (byCompany[job.companyName] ?? 0) + 1;
            items.push({
                stage: stage.stageName ?? 'Unknown',
                company: job.companyName,
                status: stage.status,
            });
        });
    });

    return { byStatus, byCompany, items };
}

export interface ResumePerformance {
    resumeId: string;
    resumeName: string;
    totalJobs: number;
    callbacks: number;
    offers: number;
}

export function buildResumePerformance(jobs: Job[], resumes: ResumeVersion[]): ResumePerformance[] {
    const map = new Map<string, ResumePerformance>();

    jobs.forEach((job) => {
        if (!job.resumeVersion) return;
        const resume = resumes.find((r) => r._id === job.resumeVersion);
        const key = job.resumeVersion;
        const existing = map.get(key) ?? {
            resumeId: key,
            resumeName: resume?.name ?? 'Unknown',
            totalJobs: 0,
            callbacks: 0,
            offers: 0,
        };
        existing.totalJobs += 1;
        const stages = job.interviewStages ?? [];
        const pastApplied = stages.some((s) => s.order > 0 || s.status !== 'Pending');
        if (pastApplied) existing.callbacks += 1;
        if (stages.some((s) => ['Offer Received', 'Offer Accepted'].includes(s.status))) {
            existing.offers += 1;
        }
        map.set(key, existing);
    });

    return [...map.values()].sort((a, b) => b.callbacks - a.callbacks);
}

export interface OfferComparisonRow {
    jobId: string;
    companyName: string;
    role: string;
    offeredCtc?: number;
    offeredFixed?: number;
    offeredVariables?: number;
    offeredRSU?: number;
}

export function buildOfferComparison(jobs: Job[], offerColumnIds: string[]): OfferComparisonRow[] {
    return jobs
        .filter((job) => offerColumnIds.includes(job.columnId) || job.offeredCtc)
        .map((job) => ({
            jobId: job._id,
            companyName: job.companyName,
            role: job.role,
            offeredCtc: job.offeredCtc,
            offeredFixed: job.offeredCompensationFixed,
            offeredVariables: job.offeredCompensationVariables,
            offeredRSU: job.offeredCompensationRSU,
        }))
        .sort((a, b) => (b.offeredCtc ?? 0) - (a.offeredCtc ?? 0));
}

export function formatLakhs(amount?: number): string {
    if (!amount) return '—';
    return `₹${(amount / 100000).toFixed(1)}L`;
}
