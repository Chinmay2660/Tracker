import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useJobs } from './useJobs';
import { ALL_INTERVIEWS_QUERY_KEY } from './useAllInterviews';
import { getInterviewDate, isInterviewOverdue, isInterviewPast } from '../lib/interviewUtils';
import { differenceInHours, startOfDay } from 'date-fns';
import { InterviewRound } from '../types';

const REMINDER_STORAGE_KEY = 'interview-reminders-sent';
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

function getSentIds(): Set<string> {
    try {
        const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
        if (!raw) return new Set();
        const parsed = JSON.parse(raw) as string[];
        const today = startOfDay(new Date()).toISOString();
        return new Set(parsed.filter((id) => id.endsWith(`:${today}`)));
    }
    catch {
        return new Set();
    }
}

function markSent(interviewId: string): void {
    const sent = getSentIds();
    const today = startOfDay(new Date()).toISOString();
    sent.add(`${interviewId}:${today}`);
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify([...sent]));
}

export function useInterviewReminders(): void {
    const queryClient = useQueryClient();
    const { jobs = [] } = useJobs();
    const permissionRequested = useRef(false);

    useEffect(() => {
        if (permissionRequested.current || typeof Notification === 'undefined') return;
        permissionRequested.current = true;
        if (Notification.permission === 'default') {
            void Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

        const check = () => {
            const interviews = queryClient.getQueryData<InterviewRound[]>(ALL_INTERVIEWS_QUERY_KEY) ?? [];
            const sent = getSentIds();
            const now = new Date();

            interviews.forEach((interview) => {
                if (interview.status !== 'pending' || !interview._id) return;
                const key = `${interview._id}:${startOfDay(now).toISOString()}`;
                if (sent.has(key)) return;

                const interviewDate = getInterviewDate(interview);
                const hoursUntil = differenceInHours(interviewDate, now);

                const shouldNotify = isInterviewOverdue(interview)
                    || (!isInterviewPast(interview) && hoursUntil >= 0 && hoursUntil <= 24);

                if (!shouldNotify) return;

                const job = jobs.find((j) => j._id === interview.jobId);
                const title = isInterviewOverdue(interview)
                    ? 'Overdue interview'
                    : 'Upcoming interview';
                const body = `${job?.companyName ?? 'Company'} — ${interview.stage}${interview.time ? ` at ${interview.time}` : ''}`;

                new Notification(title, { body, tag: interview._id });
                markSent(interview._id);
            });
        };

        check();
        const interval = setInterval(check, CHECK_INTERVAL_MS);
        const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
            if (event.type === 'updated' && event.query.queryKey[0] === 'interviews') {
                check();
            }
        });
        return () => {
            clearInterval(interval);
            unsubscribe();
        };
    }, [queryClient, jobs]);
}
