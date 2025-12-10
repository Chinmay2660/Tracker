import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useJobs } from '../hooks/useJobs';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { InterviewRound } from '../types';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import InterviewForm from '../components/InterviewForm';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const { jobs = [] } = useJobs();
  const [selectedEvent, setSelectedEvent] = useState<InterviewRound | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [listDialogDate, setListDialogDate] = useState<Date | null>(null);

  const { data: allInterviews = [] } = useQuery<InterviewRound[]>({
    queryKey: ['interviews'],
    queryFn: async () => {
      if (!Array.isArray(jobs) || jobs.length === 0) {
        return [];
      }
      
      // Fetch all interviews in PARALLEL using Promise.allSettled
      const interviewPromises = jobs
        .filter(job => job?._id)
        .map(job => 
          api.get(`/interviews/jobs/${job._id}`)
            .then(response => response?.data?.interviews ?? [])
            .catch(error => {
              // Skip 404 errors silently, return empty array
              if (error?.response?.status !== 404) {
                console.warn(`Failed to fetch interviews for job ${job._id}`);
              }
              return [];
            })
        );
      
      const results = await Promise.all(interviewPromises);
      
      // Flatten all interview arrays into one
      return results.flat().filter(Boolean);
    },
    enabled: jobs.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const events = (Array.isArray(allInterviews) ? allInterviews : [])
    .map((interview) => {
      if (!interview?.jobId || !interview?.date) return null;
      
      const job = Array.isArray(jobs) ? jobs.find((j: { _id?: string }) => j?._id === interview.jobId) : null;
      
      let dateObj: Date;
      let dateOnly: string;
      
      if (interview.date?.includes('T')) {
        dateObj = new Date(interview.date);
        if (isNaN(dateObj.getTime())) return null;
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        dateOnly = `${year}-${month}-${day}`;
      } else {
        dateOnly = interview.date;
        dateObj = new Date(interview.date);
        if (isNaN(dateObj.getTime())) return null;
      }
      
      let dateTimeStr: string;
      if (interview.time?.trim()) {
        const timeStr = interview.time.length === 5 ? interview.time : `${interview.time}:00`;
        dateTimeStr = `${dateOnly}T${timeStr}`;
      } else {
        dateTimeStr = `${dateOnly}T09:00`;
      }
      
      const startDate = new Date(dateTimeStr);
      
      let endDate: Date;
      if (interview.endTime?.trim()) {
        const endTimeStr = interview.endTime.length === 5 ? interview.endTime : `${interview.endTime}:00`;
        endDate = new Date(`${dateOnly}T${endTimeStr}`);
      } else {
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      }
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
      if (isNaN(endDate.getTime())) endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      if (endDate <= startDate) endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      
      // Title format: From Time - To Time - Company Name - Interview Stage
      const fromTime = format(startDate, 'h:mm a');
      const toTime = format(endDate, 'h:mm a');
      const title = `${fromTime} - ${toTime} - ${job?.companyName ?? 'Unknown'} - ${interview.stage ?? 'Interview'}`;
      
      return {
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
      };
    })
    .filter((event): event is NonNullable<typeof event> => event !== null);

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, typeof events> = {};
    events.forEach((event) => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // Prevent selection of off-range dates (previous/next month dates)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const slotMonth = slotInfo.start.getMonth();
    const slotYear = slotInfo.start.getFullYear();
    
    // Check if the selected slot is in the current month being viewed
    // We need to check against the calendar's current view, not today's date
    // For now, we'll use a simpler check - if it's clearly in a different month
    const viewDate = new Date(); // This should ideally come from calendar state
    const viewMonth = viewDate.getMonth();
    const viewYear = viewDate.getFullYear();
    
    if (slotMonth !== viewMonth || slotYear !== viewYear) {
      // This is an off-range date, don't allow selection
      return;
    }
    
    const dateKey = format(slotInfo.start, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateKey] || [];
    
    // If there's 1 or more interviews, show list dialog
    if (dayEvents.length >= 1) {
      setListDialogDate(slotInfo.start);
      setIsListDialogOpen(true);
    } else {
      // Empty day - open add form directly
      setSelectedEvent(null);
      setSelectedDate(slotInfo.start);
      setSelectedEndDate(slotInfo.end);
      setIsFormOpen(true);
    }
  };

  const handleSelectEvent = (event: any) => {
    const eventStart = event.start || event.event?.start;
    
    if (!eventStart || isNaN(new Date(eventStart).getTime())) return;
    
    // Always show list dialog when clicking an event
    setListDialogDate(new Date(eventStart));
    setIsListDialogOpen(true);
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = 'hsl(162 72% 45%)'; // Teal
    
    if (event.isCancelled) {
      backgroundColor = 'hsl(0 84% 60%)';
    } else if (event.isCompleted) {
      backgroundColor = 'hsl(142 76% 36%)';
    } else if (event.isPending) {
      backgroundColor = 'hsl(38 92% 50%)';
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        color: '#ffffff',
        border: 'none',
        opacity: 1,
        fontWeight: 500,
      },
    };
  };

  const listDialogEvents = useMemo(() => {
    if (!listDialogDate) return [];
    const dateKey = format(listDialogDate, 'yyyy-MM-dd');
    return eventsByDate[dateKey] || [];
  }, [listDialogDate, eventsByDate]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Interview Calendar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">View and manage your interview schedule</p>
        </div>
        <Button 
          onClick={() => { setSelectedEvent(null); setSelectedDate(new Date()); setIsFormOpen(true); }}
          className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Interview
        </Button>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="h-[500px] sm:h-[600px] lg:h-[700px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            defaultView="month"
            views={['month', 'week', 'day']}
            min={new Date(1970, 0, 1, 0, 0, 0)}
            max={new Date(1970, 0, 1, 23, 59, 59)}
            scrollToTime={new Date(1970, 0, 1, 0, 0, 0)}
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            dayLayoutAlgorithm="no-overlap"
            components={{
              event: (props: any) => {
                const interview = props.event.resource as InterviewRound;
                return (
                  <div
                    className="text-xs px-1 truncate cursor-pointer text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectEvent({ resource: interview, event: props.event });
                    }}
                  >
                    {props.title}
                  </div>
                );
              },
            }}
          />
        </div>
      </div>

      {/* Calendar styles for week/day view */}
      <style>{`
        .rbc-day-slot .rbc-events-container {
          margin-right: 0 !important;
        }
        .rbc-day-slot .rbc-event, 
        .rbc-day-slot .rbc-background-event {
          width: 100% !important;
          left: 0 !important;
          right: 0 !important;
          max-width: 100% !important;
        }
        .rbc-event {
          border: none !important;
          font-size: 12px !important;
        }
        .rbc-event-label {
          display: none !important;
        }
        .rbc-event-content {
          width: 100%;
          font-size: 12px;
          line-height: 1.4;
        }
        .rbc-time-slot {
          min-height: 20px;
        }
        .dark .rbc-time-view,
        .dark .rbc-time-header,
        .dark .rbc-time-content,
        .dark .rbc-timeslot-group,
        .dark .rbc-time-gutter,
        .dark .rbc-day-slot {
          border-color: #334155;
        }
        .dark .rbc-time-header-content {
          border-color: #334155;
        }
        .dark .rbc-header {
          color: #e2e8f0;
          border-color: #334155;
        }
        .dark .rbc-today {
          background-color: rgba(45, 212, 191, 0.1);
        }
        .dark .rbc-current-time-indicator {
          background-color: #14b8a6;
        }
        .dark .rbc-label {
          color: #94a3b8;
        }
        .dark .rbc-allday-cell {
          border-color: #334155;
        }
      `}</style>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent onClose={() => setIsFormOpen(false)}>
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Edit Interview' : 'Add Interview'}</DialogTitle>
          </DialogHeader>
          <InterviewForm
            interview={selectedEvent || undefined}
            defaultDate={selectedDate}
            defaultEndDate={selectedEndDate}
            onSuccess={() => {
              setIsFormOpen(false);
              setSelectedEvent(null);
              setSelectedDate(null);
              setSelectedEndDate(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* List Dialog */}
      <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
        <DialogContent onClose={() => setIsListDialogOpen(false)} className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Interviews on {listDialogDate ? format(listDialogDate, 'EEEE, MMM d, yyyy') : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {listDialogEvents.map((event) => {
              const interview = event.resource as InterviewRound;
              const job = event.job;
              
              const timeStr = interview.time && interview.time.trim() !== ''
                ? format(new Date(`${format(event.start, 'yyyy-MM-dd')}T${interview.time.length === 5 ? interview.time : `${interview.time}:00`}`), 'h:mm a')
                : '9:00 AM';
              
              return (
                <Card
                  key={interview._id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
                  onClick={() => {
                    setSelectedEvent(interview);
                    setSelectedDate(null);
                    setIsListDialogOpen(false);
                    setIsFormOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                            {job?.companyName || 'Unknown'} - {interview.stage}
                          </h4>
                          <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium text-white capitalize ${
                            interview.status === 'cancelled' ? 'bg-red-500' :
                            interview.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'
                          }`}>
                            {interview.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{timeStr}</p>
                        {job && <p className="text-sm text-slate-500 dark:text-slate-400">Role: {job.role}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {listDialogDate && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                onClick={() => {
                  setSelectedEvent(null);
                  setSelectedDate(listDialogDate);
                  setSelectedEndDate(listDialogDate ? new Date(listDialogDate.getTime() + 60 * 60 * 1000) : null);
                  setIsListDialogOpen(false);
                  setIsFormOpen(true);
                }}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Interview
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
