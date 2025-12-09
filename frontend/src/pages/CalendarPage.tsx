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
import { useInterviews } from '../hooks/useInterviews';
import { CheckCircle2, Circle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { format } from 'date-fns';

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const { jobs = [] } = useJobs();
  const { updateInterviewAsync } = useInterviews();
  const [selectedEvent, setSelectedEvent] = useState<InterviewRound | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [listDialogDate, setListDialogDate] = useState<Date | null>(null);

  const { data: allInterviews = [], refetch: refetchInterviews } = useQuery<InterviewRound[]>({
    queryKey: ['interviews'],
    queryFn: async () => {
      const allInterviewsData: InterviewRound[] = [];
      for (const job of jobs) {
        try {
          const response = await api.get(`/interviews/jobs/${job._id}`);
          allInterviewsData.push(...response.data.interviews);
        } catch (error) {
          // Skip if no interviews
        }
      }
      return allInterviewsData;
    },
    enabled: jobs.length > 0,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const events = allInterviews
    .map((interview) => {
      const job = jobs.find((j: { _id: string }) => j._id === interview.jobId);
      
      // Parse the date - handle both ISO string and date-only string
      let dateObj: Date;
      let dateOnly: string;
      
      if (interview.date.includes('T')) {
        // If it's already an ISO string, parse it directly
        dateObj = new Date(interview.date);
        // Extract just the date part (YYYY-MM-DD)
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        dateOnly = `${year}-${month}-${day}`;
      } else {
        // If it's just a date string like "2025-12-10", use it directly
        dateOnly = interview.date;
        dateObj = new Date(interview.date);
      }
      
      // Combine date and time
      let dateTimeStr: string;
      if (interview.time && interview.time !== '00:00' && interview.time.trim() !== '') {
        // Ensure time is in HH:mm format
        const timeStr = interview.time.length === 5 ? interview.time : `${interview.time}:00`;
        dateTimeStr = `${dateOnly}T${timeStr}`;
      } else {
        // Default to 9 AM if no time specified or time is 00:00
        dateTimeStr = `${dateOnly}T09:00`;
      }
      
      const startDate = new Date(dateTimeStr);
      
      // Calculate end time
      let endDate: Date;
      if (interview.endTime && interview.endTime !== '00:00' && interview.endTime.trim() !== '') {
        const endTimeStr = interview.endTime.length === 5 ? interview.endTime : `${interview.endTime}:00`;
        endDate = new Date(`${dateOnly}T${endTimeStr}`);
      } else {
        // Default to 1 hour after start time
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      }
      
      // Validate the date
      if (isNaN(startDate.getTime())) {
        console.error('Invalid date for interview:', interview, 'dateTimeStr:', dateTimeStr);
        return null;
      }
      
      // Style based on status
      const isCompleted = interview.status === 'completed';
      const isPending = interview.status === 'pending';
      const isCancelled = interview.status === 'cancelled';
      
      // Format time for display
      const timeStr = interview.time && interview.time !== '00:00' && interview.time.trim() !== ''
        ? format(new Date(`${dateOnly}T${interview.time.length === 5 ? interview.time : `${interview.time}:00`}`), 'h:mm a')
        : '9:00 AM';
      
      // Format title as "Company Name - Stage Name - Start Time"
      const title = `${job?.companyName || 'Unknown'} - ${interview.stage} - ${timeStr}`;
      
      return {
        id: interview._id,
        title,
        start: startDate,
        end: endDate,
        resource: interview,
        status: interview.status,
        isCompleted,
        isPending,
        isCancelled,
        job,
      };
    })
    .filter((event): event is NonNullable<typeof event> => event !== null); // Filter out any null events

  // Group events by date for detecting multiple interviews per day
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, typeof events> = {};
    events.forEach((event) => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    const dateKey = format(slotInfo.start, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateKey] || [];
    
    // If more than 2 interviews on this day, show list dialog
    if (dayEvents.length > 2) {
      setListDialogDate(slotInfo.start);
      setIsListDialogOpen(true);
    } else {
      setSelectedEvent(null);
      setSelectedDate(slotInfo.start);
      setIsFormOpen(true);
    }
  };

  const handleSelectEvent = (event: any) => {
    // Handle both direct event clicks and custom event component clicks
    const eventStart = event.start || event.event?.start;
    const interview = event.resource || event.event?.resource;
    
    if (!eventStart || isNaN(new Date(eventStart).getTime())) {
      console.error('Invalid event start date:', event);
      return;
    }
    
    const dateKey = format(new Date(eventStart), 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateKey] || [];
    
    // If more than 2 interviews on this day, show list dialog
    if (dayEvents.length > 2) {
      setListDialogDate(new Date(eventStart));
      setIsListDialogOpen(true);
    } else {
      // Make sure we're getting the interview from the event resource
      if (interview) {
        setSelectedEvent(interview);
        setSelectedDate(null);
        setIsFormOpen(true);
      }
    }
  };

  const handleMarkComplete = async (interview: InterviewRound, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateInterviewAsync({
        id: interview._id,
        status: interview.status === 'completed' ? 'pending' : 'completed',
      });
    } catch (error) {
      console.error('Error updating interview status:', error);
    }
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = 'hsl(var(--primary))';
    let borderColor = 'hsl(var(--primary))';
    
    if (event.isCancelled) {
      backgroundColor = 'hsl(0 84% 60%)'; // Red for cancelled
      borderColor = 'hsl(0 84% 60%)';
    } else if (event.isCompleted) {
      backgroundColor = 'hsl(142 76% 36%)'; // Green for completed
      borderColor = 'hsl(142 76% 36%)';
    } else if (event.isPending) {
      backgroundColor = 'hsl(38 92% 50%)'; // Orange/Yellow for pending
      borderColor = 'hsl(38 92% 50%)';
    }
    
    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderRadius: '4px',
        color: 'white',
        opacity: event.isCompleted || event.isCancelled ? 0.8 : 1,
      },
      className: 'rbc-event-white-text',
    };
  };

  // Get events for the list dialog date
  const listDialogEvents = useMemo(() => {
    if (!listDialogDate) return [];
    const dateKey = format(listDialogDate, 'yyyy-MM-dd');
    return eventsByDate[dateKey] || [];
  }, [listDialogDate, eventsByDate]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Interview Calendar</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your interview schedule
        </p>
      </div>
      <div className="bg-card rounded-lg p-4 h-[900px] border border-border shadow-sm">
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
          style={{ height: '100%' }}
          className="text-foreground rbc-calendar-custom"
          eventPropGetter={eventStyleGetter}
          components={{
            event: (props: any) => {
              const interview = props.event.resource as InterviewRound;
              return (
                <div
                  className="rbc-event-content rbc-event-white-text"
                  style={{ color: 'white' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Pass the event object with resource
                    handleSelectEvent({ resource: interview, event: props.event });
                  }}
                >
                  <div className="flex items-center justify-between gap-2" style={{ color: 'white' }}>
                    <span className="flex-1 truncate" style={{ color: 'white' }}>{props.title}</span>
                    <button
                      onClick={(e) => handleMarkComplete(interview, e)}
                      className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
                      style={{ color: 'white' }}
                      title={interview.status === 'completed' ? 'Mark as Pending' : 'Mark as Complete'}
                    >
                      {interview.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4" style={{ color: 'white' }} />
                      ) : (
                        <Circle className="h-4 w-4" style={{ color: 'white' }} />
                      )}
                    </button>
                  </div>
                </div>
              );
            },
          }}
        />
      </div>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent onClose={() => setIsFormOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Edit Interview' : 'Add Interview'}
            </DialogTitle>
          </DialogHeader>
          <InterviewForm
            interview={selectedEvent || undefined}
            defaultDate={selectedDate}
            onSuccess={() => {
              setIsFormOpen(false);
              setSelectedEvent(null);
              setSelectedDate(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* List Dialog for days with more than 2 interviews */}
      <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
        <DialogContent onClose={() => setIsListDialogOpen(false)} className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Interviews on {listDialogDate ? format(listDialogDate, 'EEEE, MMM d, yyyy') : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {listDialogEvents.map((event) => {
              const interview = event.resource as InterviewRound;
              const job = event.job;
              const isCompleted = interview.status === 'completed';
              const isCancelled = interview.status === 'cancelled';
              const isPending = interview.status === 'pending';
              
              // Get time display
              const timeStr = interview.time && interview.time !== '00:00' && interview.time.trim() !== ''
                ? format(new Date(`${format(event.start, 'yyyy-MM-dd')}T${interview.time.length === 5 ? interview.time : `${interview.time}:00`}`), 'h:mm a')
                : '9:00 AM';
              
              const endTimeStr = interview.endTime && interview.endTime !== '00:00' && interview.endTime.trim() !== ''
                ? format(new Date(`${format(event.start, 'yyyy-MM-dd')}T${interview.endTime.length === 5 ? interview.endTime : `${interview.endTime}:00`}`), 'h:mm a')
                : format(new Date(event.end), 'h:mm a');
              
              return (
                <Card
                  key={interview._id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    isCancelled ? 'border-red-500 bg-red-500/10' :
                    isCompleted ? 'border-green-500 bg-green-500/10' :
                    'border-orange-500 bg-orange-500/10'
                  }`}
                  onClick={() => {
                    setSelectedEvent(interview);
                    setSelectedDate(null);
                    setIsListDialogOpen(false);
                    setIsFormOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">
                            {job?.companyName || 'Unknown'} - {interview.stage}
                          </h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            isCancelled ? 'bg-red-500 text-white' :
                            isCompleted ? 'bg-green-500 text-white' :
                            'bg-orange-500 text-white'
                          }`}>
                            {interview.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {timeStr} - {endTimeStr}
                        </p>
                        {job && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Role: {job.role}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkComplete(interview, e);
                        }}
                        className="flex-shrink-0 p-2 rounded hover:bg-accent transition-colors ml-2"
                        title={interview.status === 'completed' ? 'Mark as Pending' : 'Mark as Complete'}
                      >
                        {interview.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-orange-500" />
                        )}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {listDialogDate && (
            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={() => {
                  setSelectedEvent(null);
                  setSelectedDate(listDialogDate);
                  setIsListDialogOpen(false);
                  setIsFormOpen(true);
                }}
                className="w-full"
              >
                Add New Interview
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

