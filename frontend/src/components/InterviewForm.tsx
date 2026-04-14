import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useInterviews } from '../hooks/useInterviews';
import { useJobs } from '../hooks/useJobs';
import { useColumns } from '../hooks/useColumns';
import { useHrContacts } from '../hooks/useHrContacts';
import { formatHrContactCompanyDisplay } from '../lib/hrContactDisplay';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { InterviewRound } from '../types';
import { format } from 'date-fns';
import { Trash2, AlertCircle } from 'lucide-react';
function resolveHrContactIdValue(hr: InterviewRound['hrContactId']): string {
    if (!hr)
        return '';
    if (typeof hr === 'string')
        return hr;
    if (typeof hr === 'object' && hr !== null && '_id' in hr) {
        return String((hr as {
            _id: string;
        })._id);
    }
    return '';
}
const interviewSchema = z.object({
    jobId: z.string().min(1, 'Job is required'),
    hrContactId: z.string().optional(),
    stage: z.string().min(1, 'Stage is required'),
    date: z.string().optional(),
    time: z.string().min(1, 'From time is required'),
    endTime: z.string().min(1, 'To time is required'),
    status: z.enum(['pending', 'completed', 'cancelled']).optional(),
    notesMarkdown: z.string().optional(),
}).refine((data) => {
    if (data.status === 'completed') {
        return data.notesMarkdown && data.notesMarkdown.trim().length > 0;
    }
    return true;
}, {
    message: 'Please add notes about the questions asked in this interview',
    path: ['notesMarkdown'],
});
type InterviewFormData = z.infer<typeof interviewSchema>;
interface InterviewFormProps {
    interview?: InterviewRound;
    defaultDate?: Date | null;
    defaultEndDate?: Date | null;
    onSuccess?: () => void;
}
export default function InterviewForm({ interview, defaultDate, defaultEndDate, onSuccess, }: InterviewFormProps) {
    const { createInterviewAsync, updateInterviewAsync, deleteInterviewAsync } = useInterviews();
    const { jobs = [] } = useJobs();
    const { columns = [] } = useColumns();
    const { hrContacts = [] } = useHrContacts();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const { register, handleSubmit, watch, formState: { errors, isSubmitting }, } = useForm<InterviewFormData>({
        resolver: zodResolver(interviewSchema),
        defaultValues: interview
            ? {
                jobId: interview.jobId,
                hrContactId: resolveHrContactIdValue(interview.hrContactId),
                stage: interview.stage,
                date: interview.date.includes('T')
                    ? interview.date.split('T')[0]
                    : interview.date,
                time: interview.time || '09:00',
                endTime: interview.endTime || '10:00',
                status: interview.status,
                notesMarkdown: interview.notesMarkdown || '',
            }
            : defaultDate
                ? {
                    jobId: '',
                    hrContactId: '',
                    date: format(defaultDate, 'yyyy-MM-dd'),
                    time: format(defaultDate, 'HH:mm'),
                    endTime: defaultEndDate ? format(defaultEndDate, 'HH:mm') : format(new Date(defaultDate.getTime() + 60 * 60 * 1000), 'HH:mm'),
                    status: 'pending',
                    notesMarkdown: '',
                }
                : {
                    jobId: '',
                    hrContactId: '',
                    time: '09:00',
                    endTime: '10:00',
                    status: 'pending',
                    notesMarkdown: '',
                },
    });
    const stage = watch('stage');
    const status = watch('status');
    const isRecruiterCall = stage?.toLowerCase().includes('recruiter') || stage?.toLowerCase().includes('call');
    const isCompleted = status === 'completed';
    const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
    const hrOptions = [...hrContacts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const onSubmit = async (data: InterviewFormData) => {
        setFormError(null);
        let dateStr: string;
        if (interview) {
            dateStr = data.date ?? (interview?.date?.split('T')[0] ?? interview?.date ?? '');
        }
        else {
            dateStr = data.date ?? (defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
        }
        try {
            if (interview?._id) {
                const updateData: any = {
                    stage: data.stage,
                    date: dateStr,
                    time: data.time ?? '09:00',
                    endTime: data.endTime ?? '10:00',
                    status: data.status ?? 'pending',
                    notesMarkdown: data.notesMarkdown || undefined,
                    hrContactId: data.hrContactId?.trim() ? data.hrContactId.trim() : '',
                };
                await updateInterviewAsync({ id: interview._id, ...updateData });
            }
            else {
                if (!data.jobId) {
                    setFormError('Please select a job.');
                    return;
                }
                const interviewData: any = {
                    jobId: data.jobId,
                    stage: data.stage,
                    date: dateStr,
                    time: data.time ?? '09:00',
                    endTime: data.endTime ?? '10:00',
                    status: data.status ?? 'pending',
                    notesMarkdown: data.notesMarkdown || undefined,
                };
                if (data.hrContactId?.trim()) {
                    interviewData.hrContactId = data.hrContactId.trim();
                }
                await createInterviewAsync(interviewData);
            }
            onSuccess?.();
        }
        catch (error: any) {
            const errorMessage = error?.response?.data?.message ?? error?.message ?? 'An unexpected error occurred';
            setFormError(errorMessage);
        }
    };
    return (<form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
      
      {formError && (<div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5"/>
          <p className="text-sm">{formError}</p>
        </div>)}
      
      <div className="space-y-2">
        <Label htmlFor="jobId">Job *</Label>
        <Select id="jobId" {...register('jobId')} className={errors.jobId ? 'border-destructive' : ''}>
          <option value="">Select a job</option>
          {jobs.map((job) => (<option key={job._id} value={job._id}>
              {job.companyName} - {job.role}
            </option>))}
        </Select>
        {errors.jobId && (<p className="text-sm text-destructive mt-1">{errors.jobId.message}</p>)}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hrContactId">HR contact (optional)</Label>
        <Select id="hrContactId" {...register('hrContactId')}>
          <option value="">None</option>
          {hrOptions.map((h) => (<option key={h._id} value={h._id}>
              {`${formatHrContactCompanyDisplay(h)} — ${h.hrName?.trim() || '—'}`}
            </option>))}
        </Select>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage contacts in the HR Contacts tab. Newest contacts appear first.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stage">Stage *</Label>
          <Select id="stage" {...register('stage')} className={errors.stage ? 'border-destructive' : ''}>
            <option value="">Select a stage</option>
            {sortedColumns.map((column) => (<option key={column._id} value={column.title}>
                {column.title}
              </option>))}
          </Select>
          {errors.stage && (<p className="text-sm text-destructive mt-1">{errors.stage.message}</p>)}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register('status')}>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {interview ? (<div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input id="date" {...register('date')} type="date" className={errors.date ? 'border-destructive' : ''}/>
          {errors.date && (<p className="text-sm text-destructive mt-1">{errors.date.message}</p>)}
        </div>) : (defaultDate && (<div className="space-y-2">
            <Label>Date</Label>
            <p className="text-sm font-medium text-muted-foreground">
              {format(defaultDate, 'EEEE, MMM d, yyyy')}
            </p>
          </div>))}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="time">From Time *</Label>
          <Input id="time" {...register('time')} type="time" autoComplete="off" className={errors.time ? 'border-destructive' : ''}/>
          {errors.time && (<p className="text-sm text-destructive mt-1">{errors.time.message}</p>)}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">To Time *</Label>
          <Input id="endTime" {...register('endTime')} type="time" autoComplete="off" className={errors.endTime ? 'border-destructive' : ''}/>
          {errors.endTime && (<p className="text-sm text-destructive mt-1">{errors.endTime.message}</p>)}
        </div>
      </div>

      
      <div className="space-y-2">
        <Label htmlFor="notesMarkdown" className="flex items-center gap-2">
          Notes / Questions Asked
          {isCompleted && <span className="text-red-500">*</span>}
        </Label>
        <textarea id="notesMarkdown" {...register('notesMarkdown')} placeholder={isCompleted
            ? "Please enter the questions asked during this interview..."
            : "Add notes about the interview, questions asked, etc. (optional)"} rows={4} className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none ${errors.notesMarkdown
            ? 'border-destructive'
            : 'border-slate-300 dark:border-slate-700'}`}/>
        {errors.notesMarkdown && (<p className="text-sm text-destructive mt-1">{errors.notesMarkdown.message}</p>)}
        {isCompleted && !errors.notesMarkdown && (<p className="text-xs text-slate-500 dark:text-slate-400">
            Recording questions helps you prepare for similar interviews in the future.
          </p>)}
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
        {interview && (<>
            <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="gap-2 w-full sm:w-auto">
              <Trash2 className="h-4 w-4"/>
              Delete
            </Button>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent onClose={() => setIsDeleteDialogOpen(false)}>
                <DialogHeader>
                  <DialogTitle>Delete Interview</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this interview? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="button" variant="destructive" onClick={async () => {
                try {
                    if (!interview?._id || !interview?.jobId) {
                        toast.error('Invalid interview data', {
                            description: 'Cannot delete interview with missing information.',
                        });
                        return;
                    }
                    await deleteInterviewAsync({
                        id: interview._id,
                        jobId: interview.jobId,
                    });
                    setIsDeleteDialogOpen(false);
                    onSuccess?.();
                }
                catch (error: any) {
                    const errorMessage = error?.response?.data?.message ?? error?.message ?? 'An unexpected error occurred';
                    toast.error('Failed to delete interview', {
                        description: errorMessage,
                    });
                }
            }} className="w-full sm:w-auto">
                    Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>)}
        <Button type="submit" disabled={isSubmitting} className={interview ? "w-full sm:w-auto sm:ml-auto" : "w-full sm:w-auto ml-auto"}>
          {interview ? 'Update' : 'Create'} Interview
        </Button>
      </div>
    </form>);
}
