import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInterviews } from '../hooks/useInterviews';
import { useJobs } from '../hooks/useJobs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { InterviewRound } from '../types';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

const interviewSchema = z.object({
  jobId: z.string().min(1, 'Job is required'),
  stage: z.string().min(1, 'Stage is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().optional(),
  notesMarkdown: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

type InterviewFormData = z.infer<typeof interviewSchema>;

interface InterviewFormProps {
  interview?: InterviewRound;
  defaultDate?: Date | null;
  onSuccess?: () => void;
}

export default function InterviewForm({
  interview,
  defaultDate,
  onSuccess,
}: InterviewFormProps) {
  const { createInterview, updateInterview } = useInterviews();
  const { jobs = [] } = useJobs();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema),
    defaultValues: interview
      ? {
          jobId: interview.jobId,
          stage: interview.stage,
          date: interview.time
            ? `${interview.date}T${interview.time}`
            : `${interview.date}T09:00`,
          time: interview.time || '',
          notesMarkdown: interview.notesMarkdown || '',
          status: interview.status,
        }
      : defaultDate
      ? {
          date: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
        }
      : {},
  });

  const notesValue = watch('notesMarkdown');

  const onSubmit = async (data: InterviewFormData) => {
    // Handle datetime-local format: "2024-01-01T10:00"
    let dateStr = data.date;
    let timeStr = data.time;
    
    if (data.date.includes('T')) {
      const [datePart, timePart] = data.date.split('T');
      dateStr = datePart;
      timeStr = timePart || data.time || '';
    }

    const interviewData = {
      ...data,
      date: dateStr,
      time: timeStr,
    };

    if (interview) {
      updateInterview({ id: interview._id, ...interviewData });
    } else {
      createInterview(interviewData);
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="jobId">Job *</Label>
        <Select
          id="jobId"
          {...register('jobId')}
          className={errors.jobId ? 'border-destructive' : ''}
        >
          <option value="">Select a job</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.companyName} - {job.role}
            </option>
          ))}
        </Select>
        {errors.jobId && (
          <p className="text-sm text-destructive mt-1">{errors.jobId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stage">Stage *</Label>
          <Input
            id="stage"
            {...register('stage')}
            className={errors.stage ? 'border-destructive' : ''}
            placeholder="e.g., Phone Screen, Technical Round"
          />
          {errors.stage && (
            <p className="text-sm text-destructive mt-1">{errors.stage.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register('status')}>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date & Time *</Label>
          <Input
            id="date"
            {...register('date')}
            type="datetime-local"
            className={errors.date ? 'border-destructive' : ''}
          />
          {errors.date && (
            <p className="text-sm text-destructive mt-1">{errors.date.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="notesMarkdown">Notes (Markdown)</Label>
        <Textarea
          id="notesMarkdown"
          {...register('notesMarkdown')}
          rows={4}
          className="font-mono text-sm"
        />
        {notesValue && (
          <div className="mt-2 p-4 border rounded-md bg-muted/50">
            <p className="text-sm font-semibold mb-2">Preview:</p>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{notesValue}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {interview ? 'Update' : 'Create'} Interview
        </Button>
      </div>
    </form>
  );
}

