import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { useInterviews } from '../hooks/useInterviews';
import { InterviewRound, Job } from '../types';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: InterviewRound | null;
  job?: Job | null;
  onSuccess?: () => void;
}

export default function RescheduleDialog({
  open,
  onOpenChange,
  interview,
  job,
  onSuccess,
}: RescheduleDialogProps) {
  const { updateInterviewAsync } = useInterviews();
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('09:00');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('10:00');
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Reset form when interview changes
  useEffect(() => {
    if (interview && open) {
      // Pre-fill with tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setRescheduleDate(format(tomorrow, 'yyyy-MM-dd'));
      setRescheduleTime(interview.time || '09:00');
      setRescheduleEndTime(interview.endTime || '10:00');
    }
  }, [interview, open]);

  const handleReschedule = async () => {
    if (!interview || !rescheduleDate) return;

    setIsRescheduling(true);
    try {
      await updateInterviewAsync({
        id: interview._id,
        date: rescheduleDate,
        time: rescheduleTime,
        endTime: rescheduleEndTime,
        status: 'pending', // Reset status to pending when rescheduling
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to reschedule:', error);
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setRescheduleDate('');
    setRescheduleTime('09:00');
    setRescheduleEndTime('10:00');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={handleClose} className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-teal-500" />
            Reschedule Interview
          </DialogTitle>
        </DialogHeader>

        {interview && (
          <div className="space-y-4 mt-2">
            {/* Interview Info */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <p className="font-medium text-slate-900 dark:text-white">
                {interview.stage}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {job?.companyName || 'Unknown Company'}
              </p>
            </div>

            {/* New Date */}
            <div className="space-y-2">
              <Label htmlFor="reschedule-date">New Date *</Label>
              <Input
                id="reschedule-date"
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            {/* New Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="reschedule-time">From Time</Label>
                <Input
                  id="reschedule-time"
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reschedule-end-time">To Time</Label>
                <Input
                  id="reschedule-end-time"
                  type="time"
                  value={rescheduleEndTime}
                  onChange={(e) => setRescheduleEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReschedule}
                disabled={!rescheduleDate || isRescheduling}
                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
              >
                {isRescheduling ? 'Saving...' : 'Reschedule'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

