import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useJobs } from '../hooks/useJobs';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { InterviewRound } from '../types';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import InterviewFormDialog from '../components/InterviewFormDialog';
import RescheduleDialog from '../components/RescheduleDialog';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { format } from 'date-fns';
import { Plus, CalendarClock, Pencil } from 'lucide-react';

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const { jobs = [] } = useJobs();
  const [selectedEvent, setSelectedEvent] = useState<InterviewRound | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [listDialogDate, setListDialogDate] = useState<Date | null>(null);
  
  // Reschedule state
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleInterview, setRescheduleInterview] = useState<InterviewRound | null>(null);

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

  // Get job by ID helper
  const getJob = (jobId: string) => {
    return jobs.find(j => j._id === jobId);
  };

  // Open reschedule dialog
  const openRescheduleDialog = (interview: InterviewRound, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRescheduleInterview(interview);
    setIsRescheduleOpen(true);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Interview Calendar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">View and manage your interview schedule</p>
        </div>
        <Button 
          onClick={() => { setSelectedEvent(null); setSelectedDate(new Date()); setIsFormOpen(true); }}
          className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
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
            drilldownView={null}
            onDrillDown={(date) => {
              // Instead of navigating to day view, trigger our slot selection
              handleSelectSlot({ start: date, end: new Date(date.getTime() + 60 * 60 * 1000) });
            }}
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

      {/* Calendar styles */}
      <style>{`
        /* Toolbar - mobile layout: Nav buttons, then label, then view buttons */
        .rbc-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
          justify-content: center;
          align-items: center;
        }
        /* Navigation buttons (Today, Back, Next) - first row */
        .rbc-toolbar > .rbc-btn-group:first-child {
          order: 1;
          width: 100%;
          justify-content: center;
        }
        /* Month label - second row */
        .rbc-toolbar-label {
          order: 2;
          width: 100%;
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          padding: 4px 0;
        }
        /* View buttons (Month, Week, Day) - third row */
        .rbc-toolbar > .rbc-btn-group:last-child {
          order: 3;
          width: 100%;
          justify-content: center;
        }
        .rbc-btn-group {
          display: flex;
          gap: 4px;
        }
        .rbc-btn-group + .rbc-btn-group {
          margin-left: 0;
        }
        
        /* Desktop: single line layout */
        @media (min-width: 768px) {
          .rbc-toolbar {
            flex-wrap: nowrap;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 28px;
          }
          .rbc-toolbar > .rbc-btn-group:first-child {
            order: 1;
            width: auto;
          }
          .rbc-toolbar-label {
            order: 2;
            width: auto;
            flex: 1;
            padding: 0;
          }
          .rbc-toolbar > .rbc-btn-group:last-child {
            order: 3;
            width: auto;
          }
        }
        
        /* Week/Day view styles */
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
        
        /* Dark mode styles - comprehensive */
        .dark .rbc-calendar {
          background-color: transparent;
        }
        .dark .rbc-toolbar-label {
          color: #f1f5f9;
        }
        .dark .rbc-toolbar button {
          color: #e2e8f0;
          border-color: #475569;
        }
        .dark .rbc-toolbar button:hover {
          background-color: #334155;
          border-color: #475569;
        }
        .dark .rbc-toolbar button.rbc-active {
          background-color: #334155;
          border-color: #475569;
        }
        .dark .rbc-month-view {
          border: 1px solid #475569 !important;
          background-color: transparent;
        }
        .dark .rbc-month-view,
        .dark .rbc-time-view,
        .dark .rbc-time-header,
        .dark .rbc-time-content,
        .dark .rbc-timeslot-group,
        .dark .rbc-time-gutter,
        .dark .rbc-day-slot,
        .dark .rbc-month-row,
        .dark .rbc-day-bg,
        .dark .rbc-row-bg,
        .dark .rbc-row-content,
        .dark .rbc-date-cell {
          border-color: #475569 !important;
          background-color: transparent;
        }
        .dark .rbc-time-header-content {
          border-color: #475569 !important;
        }
        .dark .rbc-header {
          color: #e2e8f0;
          border-color: #475569 !important;
          background-color: #0f172a !important;
          padding: 8px 4px;
        }
        .dark .rbc-month-row {
          border-top: 1px solid #475569 !important;
        }
        .dark .rbc-month-row + .rbc-month-row {
          border-color: #475569 !important;
        }
        .dark .rbc-day-bg {
          background-color: transparent !important;
        }
        .dark .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid #475569 !important;
        }
        .dark .rbc-off-range-bg {
          background-color: rgba(15, 23, 42, 0.6) !important;
        }
        .dark .rbc-off-range {
          color: #64748b;
        }
        .dark .rbc-today {
          background-color: rgba(45, 212, 191, 0.08) !important;
        }
        .dark .rbc-current-time-indicator {
          background-color: #14b8a6;
        }
        .dark .rbc-label {
          color: #94a3b8;
        }
        .dark .rbc-allday-cell {
          border-color: #475569 !important;
        }
        .dark .rbc-row-segment {
          border-color: #475569 !important;
        }
        .dark .rbc-date-cell {
          color: #e2e8f0;
          padding: 4px 8px;
        }
        .dark .rbc-button-link {
          color: #e2e8f0;
        }
        .dark .rbc-show-more {
          color: #14b8a6;
        }
      `}</style>

      {/* Form Dialog */}
      <InterviewFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        interview={selectedEvent}
        defaultDate={selectedDate}
        defaultEndDate={selectedEndDate}
        onSuccess={() => {
          setSelectedEvent(null);
          setSelectedDate(null);
          setSelectedEndDate(null);
        }}
      />

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
                  className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 group"
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
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {/* Reschedule Button - only for pending */}
                        {interview.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20"
                            onClick={(e) => openRescheduleDialog(interview, e)}
                            title="Reschedule"
                          >
                            <CalendarClock className="w-4 h-4" />
                          </Button>
                        )}
                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(interview);
                            setSelectedDate(null);
                            setIsListDialogOpen(false);
                            setIsFormOpen(true);
                          }}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
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

      {/* Reschedule Dialog */}
      <RescheduleDialog
        open={isRescheduleOpen}
        onOpenChange={setIsRescheduleOpen}
        interview={rescheduleInterview}
        job={rescheduleInterview ? getJob(rescheduleInterview.jobId) : null}
        onSuccess={() => {
          setRescheduleInterview(null);
          setIsListDialogOpen(false);
        }}
      />
    </div>
  );
}
