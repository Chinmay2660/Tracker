import { useState, useMemo } from 'react';
import { useJobs } from '../hooks/useJobs';
import { useAllInterviews } from '../hooks/useAllInterviews';
import { HrContactBrief, InterviewRound, Job } from '../types';
import { formatHrContactCompanyDisplay } from '../lib/hrContactDisplay';
import { getInterviewDate, isInterviewPast, isInterviewOverdue, formatInterviewTime } from '../lib/interviewUtils';
import InterviewFormDialog from '../components/InterviewFormDialog';
import RescheduleDialog from '../components/RescheduleDialog';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { format } from 'date-fns';
import { Plus, Calendar, Building2, Clock, Filter, Pencil, CalendarClock, User, Download } from 'lucide-react';
import { downloadIcalFeed } from '../lib/icalExport';

function getInterviewHrBrief(interview: InterviewRound): HrContactBrief | null {
    const h = interview.hrContactId;
    if (!h || typeof h === 'string') {
        return null;
    }
    if (typeof h === 'object' && h !== null && 'hrName' in h) {
        return h as HrContactBrief;
    }
    return null;
}

type StatusFilter = 'all' | 'upcoming' | 'completed' | 'cancelled' | 'overdue';

export default function InterviewsPage() {
    const { jobs = [] } = useJobs();
    const { data: allInterviews = [], isLoading } = useAllInterviews();
    const [selectedInterview, setSelectedInterview] = useState<InterviewRound | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const getJob = (jobId: string): Job | undefined => jobs.find((j) => j._id === jobId);

    const filteredInterviews = useMemo(() => {
        return allInterviews
            .filter((interview) => {
                const past = isInterviewPast(interview);
                const overdue = isInterviewOverdue(interview);
                switch (statusFilter) {
                    case 'upcoming':
                        return !past;
                    case 'overdue':
                        return overdue;
                    case 'completed':
                        return interview.status === 'completed';
                    case 'cancelled':
                        return interview.status === 'cancelled';
                    default:
                        return true;
                }
            })
            .sort((a, b) => getInterviewDate(b).getTime() - getInterviewDate(a).getTime());
    }, [allInterviews, statusFilter]);

    const statusCounts = useMemo(() => {
        const counts = { all: 0, upcoming: 0, overdue: 0, completed: 0, cancelled: 0 };
        allInterviews.forEach((interview) => {
            counts.all++;
            const past = isInterviewPast(interview);
            if (interview.status === 'completed') {
                counts.completed++;
            }
            else if (interview.status === 'cancelled') {
                counts.cancelled++;
            }
            else if (past && interview.status === 'pending') {
                counts.overdue++;
            }
            else if (!past) {
                counts.upcoming++;
            }
        });
        return counts;
    }, [allInterviews]);

    const openRescheduleDialog = (interview: InterviewRound, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedInterview(interview);
        setIsRescheduleOpen(true);
    };

    const getStatusBadgeClass = (status: string, overdue = false) => {
        if (overdue) {
            return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
        }
        switch (status) {
            case 'completed':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'cancelled':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        }
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            <PageHeader
                title="Interviews"
                description="Manage and track all your interview rounds"
                actions={(
                    <>
                    <Button
                        variant="outline"
                        onClick={() => downloadIcalFeed(allInterviews, jobs)}
                        className="w-full sm:w-auto"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export iCal
                    </Button>
                    <Button
                        onClick={() => {
                            setSelectedInterview(null);
                            setIsFormOpen(true);
                        }}
                        className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Interview
                    </Button>
                    </>
                )}
            />

            <div className="flex items-center justify-end gap-3">
                <Filter className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="w-auto min-w-[200px]">
                    <option value="all">All Interviews ({statusCounts.all})</option>
                    <option value="upcoming">Upcoming ({statusCounts.upcoming})</option>
                    <option value="completed">Completed ({statusCounts.completed})</option>
                    <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
                    <option value="overdue">Overdue - Needs Action ({statusCounts.overdue})</option>
                </Select>
            </div>

            {isLoading ? (
                <div className="grid gap-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/5" />
                                </div>
                                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredInterviews.length === 0 ? (
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="py-12 text-center">
                        <Calendar className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            No interviews found
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            {statusFilter === 'upcoming'
                                ? 'No upcoming interviews scheduled.'
                                : statusFilter === 'overdue'
                                    ? 'Great! No overdue interviews.'
                                    : statusFilter === 'completed'
                                        ? 'No completed interviews yet.'
                                        : statusFilter === 'cancelled'
                                            ? 'No cancelled interviews.'
                                            : 'Schedule your first interview to get started.'}
                        </p>
                        {(statusFilter === 'upcoming' || statusFilter === 'all') && (
                            <Button onClick={() => { setSelectedInterview(null); setIsFormOpen(true); }} className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Interview
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {filteredInterviews.map((interview) => {
                        const job = getJob(interview.jobId);
                        const hr = getInterviewHrBrief(interview);
                        const hrCompanyLine = hr ? formatHrContactCompanyDisplay(hr) : '—';
                        const interviewDate = getInterviewDate(interview);
                        const overdue = isInterviewOverdue(interview);
                        return (
                            <Card
                                key={interview._id}
                                className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => {
                                    setSelectedInterview(interview);
                                    setIsFormOpen(true);
                                }}
                            >
                                <CardContent className="p-3 sm:p-4">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                                            <h3 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg">
                                                {interview.stage} - {job?.companyName || 'Unknown'}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${getStatusBadgeClass(interview.status, overdue)}`}>
                                                {overdue ? 'Overdue' : interview.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-0.5 flex-shrink-0">
                                            {interview.status === 'pending' && (
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20" onClick={(e) => openRescheduleDialog(interview, e)} title="Reschedule">
                                                    <CalendarClock className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedInterview(interview);
                                                setIsFormOpen(true);
                                            }} title="Edit">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {job?.role && (
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-2">
                                            <Building2 className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{job.role}</span>
                                        </div>
                                    )}
                                    {hr && (
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-2">
                                            <User className="w-4 h-4 flex-shrink-0 text-teal-600 dark:text-teal-400" />
                                            <span className="truncate">
                                                HR: {hr.hrName?.trim() || '—'}
                                                {hr.phone?.trim() ? ` · ${hr.phone.trim()}` : ''}
                                                {hrCompanyLine !== '—' ? ` (${hrCompanyLine})` : ''}
                                            </span>
                                        </div>
                                    )}
                                    {hr?.noticePeriodLwdNote ? (
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 pl-5 border-l-2 border-teal-200 dark:border-teal-800 line-clamp-3">
                                            <span className="font-medium text-slate-600 dark:text-slate-300">Notice / LWD: </span>
                                            {hr.noticePeriodLwdNote}
                                        </div>
                                    ) : null}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 flex-shrink-0" />
                                            <span>{format(interviewDate, 'EEE, MMM d, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span>{formatInterviewTime(interview)}</span>
                                        </div>
                                    </div>
                                    {interview.notesMarkdown && (
                                        <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                            <span className="font-medium text-slate-600 dark:text-slate-300">Notes: </span>
                                            {interview.notesMarkdown}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <InterviewFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} interview={selectedInterview} defaultDate={new Date()} onSuccess={() => setSelectedInterview(null)} />
            <RescheduleDialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen} interview={selectedInterview} job={selectedInterview ? getJob(selectedInterview.jobId) : null} onSuccess={() => setSelectedInterview(null)} />
        </div>
    );
}
