import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useJobs } from '../hooks/useJobs';
import { useResumes } from '../hooks/useResumes';
import { useColumns } from '../hooks/useColumns';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import TagAutocomplete from './TagAutocomplete';
import { Job } from '../types';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

const jobSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  jobUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().min(1, 'Location is required'),
  tags: z.array(z.string()).default([]),
  compensationType: z.enum(['fixed', 'range']).optional(),
  compensationMin: z.number().optional(),
  compensationMax: z.number().optional(),
  resumeVersion: z.string().optional(),
  notesMarkdown: z.string().optional(),
  appliedDate: z.string().optional(),
  columnId: z.string().min(1, 'Column is required'),
}).refine((data) => {
  if (data.compensationType === 'fixed') {
    return data.compensationMin !== undefined && data.compensationMin > 0;
  }
  if (data.compensationType === 'range') {
    return data.compensationMin !== undefined && data.compensationMax !== undefined &&
           data.compensationMin > 0 && data.compensationMax > data.compensationMin;
  }
  return true;
}, {
  message: 'Invalid compensation values',
  path: ['compensationMin'],
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  job?: Job;
  defaultColumnId?: string;
  onSuccess?: () => void;
}

export default function JobForm({ job, defaultColumnId, onSuccess }: JobFormProps) {
  const { createJob, updateJob } = useJobs();
  const { resumes = [] } = useResumes();
  const { columns = [] } = useColumns();
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: job
      ? {
          companyName: job.companyName,
          role: job.role,
          jobUrl: job.jobUrl || '',
          location: job.location || '',
          tags: job.tags || [],
          compensationType: job.compensationType,
          compensationMin: job.compensationMin,
          compensationMax: job.compensationMax,
          resumeVersion: job.resumeVersion || '',
          notesMarkdown: job.notesMarkdown || '',
          appliedDate: job.appliedDate
            ? format(new Date(job.appliedDate), 'yyyy-MM-dd')
            : '',
          columnId: job.columnId,
        }
      : {
          tags: [],
          columnId: defaultColumnId || '',
        },
  });

  const notesValue = watch('notesMarkdown');
  const compensationType = watch('compensationType');

  const onSubmit = async (data: JobFormData) => {
    const jobData = {
      ...data,
      jobUrl: data.jobUrl || undefined,
      compensationType: data.compensationType || undefined,
      compensationMin: data.compensationMin ? Number(data.compensationMin) : undefined,
      compensationMax: data.compensationMax ? Number(data.compensationMax) : undefined,
      appliedDate: data.appliedDate ? new Date(data.appliedDate).toISOString() : undefined,
    };

    if (job) {
      updateJob({ id: job._id, ...jobData });
    } else {
      createJob(jobData);
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            {...register('companyName')}
            className={errors.companyName ? 'border-destructive' : ''}
          />
          {errors.companyName && (
            <p className="text-sm text-destructive mt-1">
              {errors.companyName.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="role">Role *</Label>
          <Input
            id="role"
            {...register('role')}
            className={errors.role ? 'border-destructive' : ''}
          />
          {errors.role && (
            <p className="text-sm text-destructive mt-1">{errors.role.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="jobUrl">Job URL</Label>
          <Input id="jobUrl" {...register('jobUrl')} type="url" />
        </div>
        <div>
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            {...register('location')}
            className={errors.location ? 'border-destructive' : ''}
            placeholder="e.g., San Francisco, CA or Remote"
          />
          {errors.location && (
            <p className="text-sm text-destructive mt-1">
              {errors.location.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TagAutocomplete
              value={field.value || []}
              onChange={field.onChange}
              placeholder="Type and press Enter to add tags"
            />
          )}
        />
      </div>

      <div>
        <Label htmlFor="compensationType">Compensation</Label>
        <div className="space-y-3">
          <Select
            id="compensationType"
            {...register('compensationType')}
            className="w-full"
          >
            <option value="">No compensation info</option>
            <option value="fixed">Fixed Amount</option>
            <option value="range">Range</option>
          </Select>
          {compensationType && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="compensationMin">
                  {compensationType === 'fixed' ? 'Amount ($)' : 'Min ($)'}
                </Label>
                <Input
                  id="compensationMin"
                  {...register('compensationMin', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g., 100000"
                  className={errors.compensationMin ? 'border-destructive' : ''}
                />
                {errors.compensationMin && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.compensationMin.message}
                  </p>
                )}
              </div>
              {compensationType === 'range' && (
                <div>
                  <Label htmlFor="compensationMax">Max ($)</Label>
                  <Input
                    id="compensationMax"
                    {...register('compensationMax', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="e.g., 150000"
                    className={errors.compensationMax ? 'border-destructive' : ''}
                  />
                  {errors.compensationMax && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.compensationMax.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!defaultColumnId && (
        <div>
          <Label htmlFor="columnId">Column *</Label>
          <Select
            id="columnId"
            {...register('columnId')}
            className={errors.columnId ? 'border-destructive' : ''}
          >
            <option value="">Select a column</option>
            {columns.map((column) => (
              <option key={column._id} value={column._id}>
                {column.title}
              </option>
            ))}
          </Select>
          {errors.columnId && (
            <p className="text-sm text-destructive mt-1">
              {errors.columnId.message}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="resumeVersion">Resume Version</Label>
          <Select id="resumeVersion" {...register('resumeVersion')}>
            <option value="">None</option>
            {resumes.map((resume) => (
              <option key={resume._id} value={resume._id}>
                {resume.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="appliedDate">Applied Date</Label>
          <Input id="appliedDate" {...register('appliedDate')} type="date" />
        </div>
      </div>

      <div>
        <Label htmlFor="notesMarkdown">Notes (Markdown)</Label>
        <Textarea
          id="notesMarkdown"
          {...register('notesMarkdown')}
          rows={6}
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
          {job ? 'Update' : 'Create'} Job
        </Button>
      </div>
    </form>
  );
}

