import { format } from 'date-fns';
import { InterviewRound, Job } from '../types';

function escapeIcal(text: string): string {
    return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function toIcalDate(date: Date): string {
    return format(date, "yyyyMMdd'T'HHmmss");
}

export function generateIcalFeed(interviews: InterviewRound[], jobs: Job[]): string {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Job Tracker//Interviews//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
    ];

    for (const interview of interviews) {
        if (!interview._id || !interview.date) continue;
        const job = jobs.find((j) => j._id === interview.jobId);
        const dateOnly = interview.date.includes('T') ? interview.date.split('T')[0] : interview.date;
        const timeStr = interview.time?.trim()
            ? (interview.time.length === 5 ? interview.time : `${interview.time}:00`)
            : '09:00';
        const endTimeStr = interview.endTime?.trim()
            ? (interview.endTime.length === 5 ? interview.endTime : `${interview.endTime}:00`)
            : '10:00';
        const start = new Date(`${dateOnly}T${timeStr}`);
        let end = new Date(`${dateOnly}T${endTimeStr}`);
        if (isNaN(end.getTime()) || end <= start) {
            end = new Date(start.getTime() + 60 * 60 * 1000);
        }

        const summary = `${job?.companyName ?? 'Interview'} — ${interview.stage}`;
        lines.push(
            'BEGIN:VEVENT',
            `UID:${interview._id}@job-tracker`,
            `DTSTAMP:${toIcalDate(new Date())}`,
            `DTSTART:${toIcalDate(start)}`,
            `DTEND:${toIcalDate(end)}`,
            `SUMMARY:${escapeIcal(summary)}`,
            `STATUS:${interview.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
            'END:VEVENT',
        );
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
}

export function downloadIcalFeed(interviews: InterviewRound[], jobs: Job[], filename = 'interviews.ics'): void {
    const content = generateIcalFeed(interviews, jobs);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
