import { memo } from 'react';
import { format, isToday, isPast, startOfDay } from 'date-fns';
import { Bell, CalendarClock } from 'lucide-react';
import { Job } from '../types';
import { getJobsDueForFollowUp } from '../lib/jobFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface FollowUpWidgetProps {
    jobs: Job[];
}

function FollowUpWidget({ jobs }: FollowUpWidgetProps) {
    const dueJobs = getJobsDueForFollowUp(jobs);
    if (dueJobs.length === 0) return null;

    return (
        <Card className="border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-600" />
                    Follow-ups due
                </CardTitle>
                <CardDescription>Jobs with a next action date today or earlier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {dueJobs.slice(0, 5).map((job) => {
                    const actionDate = new Date(job.nextActionDate!);
                    const overdue = isPast(startOfDay(actionDate)) && !isToday(actionDate);
                    return (
                        <div key={job._id} className="flex items-center justify-between gap-3 text-sm p-2 rounded-lg bg-white/60 dark:bg-slate-900/60">
                            <div className="min-w-0">
                                <p className="font-medium truncate">{job.companyName}</p>
                                <p className="text-xs text-muted-foreground truncate">{job.role}</p>
                            </div>
                            <div className={`flex items-center gap-1 text-xs flex-shrink-0 ${overdue ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                <CalendarClock className="h-3.5 w-3.5" />
                                {overdue ? 'Overdue' : isToday(actionDate) ? 'Today' : format(actionDate, 'MMM d')}
                            </div>
                        </div>
                    );
                })}
                {dueJobs.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">+{dueJobs.length - 5} more</p>
                )}
            </CardContent>
        </Card>
    );
}

export default memo(FollowUpWidget);
