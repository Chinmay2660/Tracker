import { format, parseISO, startOfDay } from 'date-fns';
import { InterviewRound, Job } from '../types';

export function getInterviewDate(interview: InterviewRound): Date {
    const dateStr = interview.date;
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
        return parseISO(dateStr);
    }
    return new Date(dateStr);
}

export function isInterviewPast(interview: InterviewRound): boolean {
    return startOfDay(getInterviewDate(interview)) < startOfDay(new Date());
}

export function isInterviewOverdue(interview: InterviewRound): boolean {
    return isInterviewPast(interview) && interview.status === 'pending';
}

export function formatInterviewTime(interview: InterviewRound): string {
    const dateStr = interview.date;
    const dateOnly = typeof dateStr === 'string' && dateStr.includes('T')
        ? dateStr.split('T')[0]
        : dateStr;
    const timeStr = interview.time?.trim()
        ? interview.time.length === 5 ? interview.time : `${interview.time}:00`
        : '09:00';
    const endTimeStr = interview.endTime?.trim()
        ? interview.endTime.length === 5 ? interview.endTime : `${interview.endTime}:00`
        : '10:00';
    const startDate = new Date(`${dateOnly}T${timeStr}`);
    const endDate = new Date(`${dateOnly}T${endTimeStr}`);
    if (isNaN(startDate.getTime())) {
        return 'Invalid time';
    }
    const fromTime = format(startDate, 'h:mm a');
    const toTime = !isNaN(endDate.getTime()) ? format(endDate, 'h:mm a') : '';
    return toTime ? `${fromTime} - ${toTime}` : fromTime;
}

export type CalendarEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: InterviewRound;
    status: InterviewRound['status'];
    isCompleted: boolean;
    isPending: boolean;
    isCancelled: boolean;
    job?: Job;
};

export function mapInterviewsToCalendarEvents(interviews: InterviewRound[], jobs: Job[]): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    for (const interview of interviews) {
        if (!interview.jobId || !interview.date) {
            continue;
        }
        const job = jobs.find((j) => j._id === interview.jobId);
        let dateObj: Date;
        let dateOnly: string;
        if (interview.date.includes('T')) {
            dateObj = new Date(interview.date);
            if (isNaN(dateObj.getTime())) {
                continue;
            }
            dateOnly = format(dateObj, 'yyyy-MM-dd');
        }
        else {
            dateOnly = interview.date;
            dateObj = new Date(interview.date);
            if (isNaN(dateObj.getTime())) {
                continue;
            }
        }
        const timeStr = interview.time?.trim()
            ? interview.time.length === 5 ? interview.time : `${interview.time}:00`
            : '09:00';
        const startDate = new Date(`${dateOnly}T${timeStr}`);
        let endDate = interview.endTime?.trim()
            ? new Date(`${dateOnly}T${interview.endTime.length === 5 ? interview.endTime : `${interview.endTime}:00`}`)
            : new Date(startDate.getTime() + 60 * 60 * 1000);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
            endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        }
        const title = `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')} - ${job?.companyName ?? 'Unknown'} - ${interview.stage ?? 'Interview'}`;
        events.push({
            id: interview._id ?? '',
            title,
            start: startDate,
            end: endDate,
            resource: interview,
            status: interview.status ?? 'pending',
            isCompleted: interview.status === 'completed',
            isPending: interview.status === 'pending',
            isCancelled: interview.status === 'cancelled',
            job,
        });
    }
    return events;
}
