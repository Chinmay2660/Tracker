import { differenceInDays, format } from 'date-fns';
import { Column, Job } from '../types';

export interface StageTimelineEntry {
    columnId: string;
    title: string;
    enteredDate: Date;
    daysInStage: number | null;
    color?: string;
}

export function buildStageTimeline(job: Job, columns: Column[]): StageTimelineEntry[] {
    const history = job.stageHistory ?? [];
    if (history.length === 0) return [];

    const sorted = [...history].sort(
        (a, b) => new Date(a.enteredDate).getTime() - new Date(b.enteredDate).getTime(),
    );

    return sorted.map((entry, idx) => {
        const column = columns.find((c) => c._id === entry.columnId);
        const title = entry.columnTitle || column?.title || 'Unknown';
        const enteredDate = new Date(entry.enteredDate);
        const nextEntry = sorted[idx + 1];
        const daysInStage = nextEntry
            ? differenceInDays(new Date(nextEntry.enteredDate), enteredDate)
            : differenceInDays(new Date(), enteredDate);

        return {
            columnId: entry.columnId,
            title,
            enteredDate,
            daysInStage: Math.max(0, daysInStage),
            color: column?.color,
        };
    });
}

export function formatStageTimelineSummary(job: Job, columns: Column[]): string | null {
    const timeline = buildStageTimeline(job, columns);
    if (timeline.length < 2) return null;

    const parts = timeline.map((entry, idx) => {
        const days = entry.daysInStage;
        if (idx < timeline.length - 1 && days !== null) {
            return `${entry.title} (${days}d)`;
        }
        return entry.title;
    });

    return parts.join(' → ');
}

export function formatTimelineDate(date: Date): string {
    return format(date, 'MMM d');
}
