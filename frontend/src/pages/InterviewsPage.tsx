import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useJobs } from '../hooks/useJobs';
import api from '../lib/api';
import { InterviewRound, Job } from '../types';
import InterviewFormDialog from '../components/InterviewFormDialog';
import RescheduleDialog from '../components/RescheduleDialog';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { format, isPast, parseISO, startOfDay } from 'date-fns';
import { Plus, Calendar, Building2, Clock, Filter, Pencil, CalendarClock } from 'lucide-react';

type StatusFilter = 'all' | 'upcoming' | 'completed' | 'cancelled' | 'overdue';

export default function InterviewsPage() {
  const { jobs = [] } = useJobs();
  const [selectedInterview, setSelectedInterview] = useState<InterviewRound | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data: allInterviews = [], isLoading } = useQuery<InterviewRound[]>({
    queryKey: ['interviews'],
    queryFn: async () => {
      if (!Array.isArray(jobs) || jobs.length === 0) {
        return [];
      }
      
      const interviewPromises = jobs
        .filter(job => job?._id)
        .map(job => 
          api.get(`/interviews/jobs/${job._id}`)
            .then(response => response?.data?.interviews ?? [])
            .catch(error => {
              if (error?.response?.status !== 404) {
                console.warn(`Failed to fetch interviews for job ${job._id}`);
              }
              return [];
            })
        );
      
      const results = await Promise.all(interviewPromises);
      return results.flat().filter(Boolean);
    },
    enabled: jobs.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Get job by ID helper
  const getJob = (jobId: string): Job | undefined => {
    return jobs.find(j => j._id === jobId);
  };

  // Parse interview date
  const getInterviewDate = (interview: InterviewRound): Date => {
    const dateStr = interview.date;
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      return parseISO(dateStr);
    }
    return new Date(dateStr);
  };

  // Check if interview is in the past
  const isInterviewPast = (interview: InterviewRound): boolean => {
    const interviewDate = getInterviewDate(interview);
    const today = startOfDay(new Date());
    return isPast(startOfDay(interviewDate)) && startOfDay(interviewDate) < today;
  };

  // Check if interview is overdue (past date but still pending)
  const isInterviewOverdue = (interview: InterviewRound): boolean => {
    return isInterviewPast(interview) && interview.status === 'pending';
  };

  // Filter and sort interviews
  const filteredInterviews = useMemo(() => {
    return allInterviews
      .filter(interview => {
        const isPastInterview = isInterviewPast(interview);
        const isOverdue = isInterviewOverdue(interview);
        
        switch (statusFilter) {
          case 'upcoming':
            return !isPastInterview;
          case 'overdue':
            return isOverdue;
          case 'completed':
            return interview.status === 'completed';
          case 'cancelled':
            return interview.status === 'cancelled';
          case 'all':
          default:
            return true;
        }
      })
      .sort((a, b) => {
        const dateA = getInterviewDate(a);
        const dateB = getInterviewDate(b);
        // Sort by date descending (latest first)
        return dateB.getTime() - dateA.getTime();
      });
  }, [allInterviews, statusFilter]);

  // Count interviews by filter type
  const statusCounts = useMemo(() => {
    const counts = { all: 0, upcoming: 0, overdue: 0, completed: 0, cancelled: 0 };
    allInterviews.forEach(interview => {
      counts.all++;
      
      const isPastInterview = isInterviewPast(interview);
      
      if (interview.status === 'completed') {
        counts.completed++;
      } else if (interview.status === 'cancelled') {
        counts.cancelled++;
      } else if (isPastInterview && interview.status === 'pending') {
        counts.overdue++;
      } else if (!isPastInterview) {
        counts.upcoming++;
      }
    });
    return counts;
  }, [allInterviews]);

  // Open reschedule dialog
  const openRescheduleDialog = (interview: InterviewRound, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedInterview(interview);
    setIsRescheduleOpen(true);
  };

  const getStatusBadgeClass = (status: string, isOverdue: boolean = false) => {
    if (isOverdue) {
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

  const formatInterviewTime = (interview: InterviewRound) => {
    const dateStr = interview.date;
    let dateOnly: string;
    
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      dateOnly = dateStr.split('T')[0];
    } else {
      dateOnly = dateStr as string;
    }
    
    const timeStr = interview.time && interview.time.trim() !== ''
      ? interview.time.length === 5 ? interview.time : `${interview.time}:00`
      : '09:00';
    
    const endTimeStr = interview.endTime && interview.endTime.trim() !== ''
      ? interview.endTime.length === 5 ? interview.endTime : `${interview.endTime}:00`
      : '10:00';
    
    const startDate = new Date(`${dateOnly}T${timeStr}`);
    const endDate = new Date(`${dateOnly}T${endTimeStr}`);
    
    if (isNaN(startDate.getTime())) return 'Invalid time';
    
    const fromTime = format(startDate, 'h:mm a');
    const toTime = !isNaN(endDate.getTime()) ? format(endDate, 'h:mm a') : '';
    
    return toTime ? `${fromTime} - ${toTime}` : fromTime;
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Interviews</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage and track all your interview rounds
          </p>
        </div>
        <Button 
          onClick={() => { setSelectedInterview(null); setIsFormOpen(true); }}
          className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Interview
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-end gap-3">
        <Filter className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
        <Select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="w-auto min-w-[200px]"
        >
          <option value="all">All Interviews ({statusCounts.all})</option>
          <option value="upcoming">Upcoming ({statusCounts.upcoming})</option>
          <option value="completed">Completed ({statusCounts.completed})</option>
          <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
          <option value="overdue">Overdue - Needs Action ({statusCounts.overdue})</option>
        </Select>
      </div>

      {/* Interview List */}
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
              <Button 
                onClick={() => { setSelectedInterview(null); setIsFormOpen(true); }}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
              >
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
            const interviewDate = getInterviewDate(interview);
            const isOverdue = isInterviewOverdue(interview);
            
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
                  {/* Header: Stage - Company, Status, Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg">
                        {interview.stage} - {job?.companyName || 'Unknown'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${getStatusBadgeClass(interview.status, isOverdue)}`}>
                        {isOverdue ? 'Overdue' : interview.status}
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {(interview.status === 'pending') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20"
                          onClick={(e) => openRescheduleDialog(interview, e)}
                          title="Reschedule"
                        >
                          <CalendarClock className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInterview(interview);
                          setIsFormOpen(true);
                        }}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Role */}
                  {job?.role && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <Building2 className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{job.role}</span>
                    </div>
                  )}
                  
                  {/* Date & Time - Stack on mobile, inline on larger screens */}
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

                  {/* Notes preview */}
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

      {/* Form Dialog */}
      <InterviewFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        interview={selectedInterview}
        defaultDate={new Date()}
        onSuccess={() => setSelectedInterview(null)}
      />

      {/* Reschedule Dialog */}
      <RescheduleDialog
        open={isRescheduleOpen}
        onOpenChange={setIsRescheduleOpen}
        interview={selectedInterview}
        job={selectedInterview ? getJob(selectedInterview.jobId) : null}
        onSuccess={() => setSelectedInterview(null)}
      />
    </div>
  );
}

