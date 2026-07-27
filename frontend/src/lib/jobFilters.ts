import { InterviewRound, Job } from '../types';
import { getInterviewDate, isInterviewPast } from './interviewUtils';

export interface KanbanFilterState {
    search: string;
    tag: string;
    columnId: string;
    hasUpcomingInterview: boolean;
    offerStageOnly: boolean;
}

export const DEFAULT_KANBAN_FILTERS: KanbanFilterState = {
    search: '',
    tag: '',
    columnId: '',
    hasUpcomingInterview: false,
    offerStageOnly: false,
};

export function filterJobs(
    jobs: Job[],
    filters: KanbanFilterState,
    interviews: InterviewRound[] = [],
    offerColumnIds: string[] = [],
): Job[] {
    const q = filters.search.trim().toLowerCase();

    return jobs.filter((job) => {
        if (q) {
            const hay = `${job.companyName} ${job.role} ${job.location} ${(job.tags ?? []).join(' ')}`.toLowerCase();
            if (!hay.includes(q)) return false;
        }
        if (filters.tag && !(job.tags ?? []).includes(filters.tag)) return false;
        if (filters.columnId && job.columnId !== filters.columnId) return false;
        if (filters.offerStageOnly && !offerColumnIds.includes(job.columnId)) return false;
        if (filters.hasUpcomingInterview) {
            const hasUpcoming = interviews.some(
                (i) => i.jobId === job._id && i.status === 'pending' && !isInterviewPast(i),
            );
            if (!hasUpcoming) return false;
        }
        return true;
    });
}

export function getUniqueJobTags(jobs: Job[]): string[] {
    const tags = new Set<string>();
    jobs.forEach((job) => (job.tags ?? []).forEach((t) => tags.add(t)));
    return [...tags].sort();
}

export function getJobsDueForFollowUp(jobs: Job[]): Job[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return jobs
        .filter((job) => {
            if (!job.nextActionDate) return false;
            const actionDate = new Date(job.nextActionDate);
            actionDate.setHours(0, 0, 0, 0);
            return actionDate <= tomorrow;
        })
        .sort((a, b) => new Date(a.nextActionDate!).getTime() - new Date(b.nextActionDate!).getTime());
}
