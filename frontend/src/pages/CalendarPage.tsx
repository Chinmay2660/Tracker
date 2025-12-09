import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useJobs } from '../hooks/useJobs';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { InterviewRound } from '../types';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import InterviewForm from '../components/InterviewForm';

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const { jobs = [] } = useJobs();
  const [selectedEvent, setSelectedEvent] = useState<InterviewRound | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: allInterviews = [] } = useQuery<InterviewRound[]>({
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
  });

  const events = allInterviews.map((interview) => {
    const job = jobs.find((j: { _id: string }) => j._id === interview.jobId);
    // Combine date and time if time exists, otherwise use date only
    let dateTimeStr = interview.date;
    if (interview.time) {
      // Ensure time is in HH:mm format
      const timeStr = interview.time.length === 5 ? interview.time : `${interview.time}:00`;
      dateTimeStr = `${interview.date}T${timeStr}`;
    } else {
      // Default to 9 AM if no time specified
      dateTimeStr = `${interview.date}T09:00`;
    }
    const startDate = new Date(dateTimeStr);
    return {
      id: interview._id,
      title: `${interview.stage} - ${job?.companyName || 'Unknown'}`,
      start: startDate,
      end: new Date(startDate.getTime() + 60 * 60 * 1000), // 1 hour default
      resource: interview,
    };
  });

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedDate(slotInfo.start);
    setIsFormOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setIsFormOpen(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Interview Calendar</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your interview schedule
        </p>
      </div>
      <div className="bg-card rounded-lg p-4 h-[600px]">
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
    </div>
  );
}

