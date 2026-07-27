import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, getDay, startOfWeek, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, endOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useJobs } from '../hooks/useJobs';
import { useAllInterviews } from '../hooks/useAllInterviews';
import { InterviewRound } from '../types';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import InterviewFormDialog from '../components/InterviewFormDialog';
import RescheduleDialog from '../components/RescheduleDialog';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Plus, CalendarClock, Pencil, Download } from 'lucide-react';
import { downloadIcalFeed } from '../lib/icalExport';
import { mapInterviewsToCalendarEvents, type CalendarEvent } from '../lib/interviewUtils';

type CalendarView = 'month' | 'week' | 'day';

function CalendarToolbar({
    date,
    view,
    onDateChange,
    onViewChange,
}: {
    date: Date;
    view: CalendarView;
    onDateChange: (date: Date) => void;
    onViewChange: (view: CalendarView) => void;
}) {
    const label = view === 'month'
        ? format(date, 'MMMM yyyy')
        : view === 'week'
            ? `${format(startOfWeek(date), 'MMM d')} – ${format(endOfWeek(date), 'MMM d, yyyy')}`
            : format(date, 'MMMM d, yyyy');

    const shiftDate = (direction: -1 | 1) => {
        if (view === 'month') {
            onDateChange(direction === 1 ? addMonths(date, 1) : subMonths(date, 1));
            return;
        }
        if (view === 'week') {
            onDateChange(direction === 1 ? addWeeks(date, 1) : subWeeks(date, 1));
            return;
        }
        onDateChange(direction === 1 ? addDays(date, 1) : subDays(date, 1));
    };

    return (
        <div className="rbc-toolbar">
            <span className="rbc-btn-group">
                <button type="button" onClick={() => onDateChange(new Date())}>Today</button>
                <button type="button" onClick={() => shiftDate(-1)}>Back</button>
                <button type="button" onClick={() => shiftDate(1)}>Next</button>
            </span>
            <span className="rbc-toolbar-label">{label}</span>
            <span className="rbc-btn-group">
                {(['month', 'week', 'day'] as const).map((option) => (
                    <button
                        key={option}
                        type="button"
                        className={view === option ? 'rbc-active' : undefined}
                        onClick={() => onViewChange(option)}
                    >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                ))}
            </span>
        </div>
    );
}

const localizer = dateFnsLocalizer({
    format,
    startOfWeek,
    getDay,
    locales: { 'en-US': enUS },
});

export default function CalendarPage() {
    const { jobs = [] } = useJobs();
    const { data: allInterviews = [], isLoading } = useAllInterviews();
    const [selectedEvent, setSelectedEvent] = useState<InterviewRound | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [isListDialogOpen, setIsListDialogOpen] = useState(false);
    const [listDialogDate, setListDialogDate] = useState<Date | null>(null);
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [rescheduleInterview, setRescheduleInterview] = useState<InterviewRound | null>(null);
    const [calendarView, setCalendarView] = useState<CalendarView>('month');
    const [calendarDate, setCalendarDate] = useState(() => new Date());
    const events = useMemo(() => mapInterviewsToCalendarEvents(allInterviews, jobs), [allInterviews, jobs]);

    const eventsByDate = useMemo(() => {
        const grouped: Record<string, typeof events> = {};
        events.forEach((event) => {
            const dateKey = format(event.start, 'yyyy-MM-dd');
            grouped[dateKey] ??= [];
            grouped[dateKey].push(event);
        });
        return grouped;
    }, [events]);

    const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
        const dateKey = format(slotInfo.start, 'yyyy-MM-dd');
        const dayEvents = eventsByDate[dateKey] ?? [];
        if (dayEvents.length >= 1) {
            setListDialogDate(slotInfo.start);
            setIsListDialogOpen(true);
            return;
        }
        setSelectedEvent(null);
        setSelectedDate(slotInfo.start);
        setSelectedEndDate(slotInfo.end);
        setIsFormOpen(true);
    };

    const handleSelectEvent = (event: { start?: Date; event?: { start?: Date } }) => {
        const eventStart = event.start ?? event.event?.start;
        if (!eventStart || isNaN(new Date(eventStart).getTime())) {
            return;
        }
        setListDialogDate(new Date(eventStart));
        setIsListDialogOpen(true);
    };

    const eventStyleGetter = (event: { isCancelled: boolean; isCompleted: boolean; isPending: boolean }) => {
        let backgroundColor = 'hsl(162 72% 45%)';
        if (event.isCancelled) {
            backgroundColor = 'hsl(0 84% 60%)';
        }
        else if (event.isCompleted) {
            backgroundColor = 'hsl(142 76% 36%)';
        }
        else if (event.isPending) {
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
        if (!listDialogDate) {
            return [];
        }
        return eventsByDate[format(listDialogDate, 'yyyy-MM-dd')] ?? [];
    }, [listDialogDate, eventsByDate]);

    const getJob = (jobId: string) => jobs.find((j) => j._id === jobId);

    const openRescheduleDialog = (interview: InterviewRound, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setRescheduleInterview(interview);
        setIsRescheduleOpen(true);
    };

    const handleCalendarViewChange = (nextView: string) => {
        if (nextView === 'month' || nextView === 'week' || nextView === 'day') {
            setCalendarView(nextView);
        }
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            <PageHeader
                title="Interview Calendar"
                description="View and manage your interview schedule"
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
                            setSelectedEvent(null);
                            setSelectedDate(new Date());
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

            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                {!isLoading && (
                    <CalendarToolbar
                        date={calendarDate}
                        view={calendarView}
                        onDateChange={setCalendarDate}
                        onViewChange={setCalendarView}
                    />
                )}
                <div className="h-[500px] sm:h-[600px] lg:h-[700px]">
                    {isLoading ? (
                        <div className="h-full flex flex-col gap-4">
                            <div className="flex justify-between">
                                <Skeleton className="h-9 w-48" />
                                <Skeleton className="h-9 w-32" />
                            </div>
                            <Skeleton className="flex-1 rounded-lg" />
                        </div>
                    ) : (
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={handleSelectEvent}
                            selectable
                            toolbar={false}
                            view={calendarView}
                            date={calendarDate}
                            onNavigate={setCalendarDate}
                            onView={handleCalendarViewChange}
                            views={['month', 'week', 'day']}
                            drilldownView={null}
                            onDrillDown={(date) => {
                                handleSelectSlot({ start: date, end: new Date(date.getTime() + 60 * 60 * 1000) });
                            }}
                            min={new Date(1970, 0, 1, 0, 0, 0)}
                            max={new Date(1970, 0, 1, 23, 59, 59)}
                            scrollToTime={new Date(1970, 0, 1, 0, 0, 0)}
                            style={{ height: '100%' }}
                            eventPropGetter={eventStyleGetter}
                            dayLayoutAlgorithm="no-overlap"
                            components={{
                                event: (props: { title: string; event: CalendarEvent }) => (
                                    <div
                                        className="text-xs px-1 truncate cursor-pointer text-white"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectEvent({ start: props.event.start });
                                        }}
                                    >
                                        {props.title}
                                    </div>
                                ),
                            }}
                        />
                    )}
                </div>
            </div>

            <style>{`
        .rbc-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
          justify-content: center;
          align-items: center;
        }
        .rbc-toolbar > .rbc-btn-group:first-child {
          order: 1;
          width: 100%;
          justify-content: center;
        }
        .rbc-toolbar-label {
          order: 2;
          width: 100%;
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          padding: 4px 0;
        }
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

        .dark .rbc-calendar {
          background-color: transparent;
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

            <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
                <DialogContent onClose={() => setIsListDialogOpen(false)} className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Interviews on {listDialogDate ? format(listDialogDate, 'EEEE, MMM d, yyyy') : ''}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                        {listDialogEvents.map((event) => {
                            const interview = event.resource;
                            const job = event.job;
                            const timeStr = interview.time?.trim()
                                ? format(new Date(`${format(event.start, 'yyyy-MM-dd')}T${interview.time.length === 5 ? interview.time : `${interview.time}:00`}`), 'h:mm a')
                                : '9:00 AM';
                            return (
                                <Card key={interview._id} className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 group">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                                                        {job?.companyName || 'Unknown'} - {interview.stage}
                                                    </h4>
                                                    <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium text-white capitalize ${interview.status === 'cancelled' ? 'bg-red-500' :
                                                        interview.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`}>
                                                        {interview.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{timeStr}</p>
                                                {job && <p className="text-sm text-slate-500 dark:text-slate-400">Role: {job.role}</p>}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {interview.status === 'pending' && (
                                                    <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20" onClick={(e) => openRescheduleDialog(interview, e)} title="Reschedule">
                                                        <CalendarClock className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedEvent(interview);
                                                    setSelectedDate(null);
                                                    setIsListDialogOpen(false);
                                                    setIsFormOpen(true);
                                                }} title="Edit">
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
                                    setSelectedEndDate(new Date(listDialogDate.getTime() + 60 * 60 * 1000));
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
