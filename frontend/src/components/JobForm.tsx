import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useJobs } from '../hooks/useJobs';
import { useResumes } from '../hooks/useResumes';
import { useColumns } from '../hooks/useColumns';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import TagSelect from './TagSelect';
import { Job } from '../types';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

const jobSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  jobUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().min(1, 'Location is required'),
  tags: z.array(z.string()).default([]),
  // Asked Compensation
  ctcMin: z.number().optional(),
  ctcMax: z.number().optional(),
  compensationFixed: z.number().optional(),
  compensationVariables: z.number().optional(),
  compensationRSU: z.number().optional(),
  // Offered Compensation
  offeredCtcMin: z.number().optional(),
  offeredCtcMax: z.number().optional(),
  offeredCompensationFixed: z.number().optional(),
  offeredCompensationVariables: z.number().optional(),
  offeredCompensationRSU: z.number().optional(),
  resumeVersion: z.string().optional(),
  notesMarkdown: z.string().optional(),
  appliedDate: z.string().optional(),
  lastWorkingDay: z.string().optional(),
  columnId: z.string().min(1, 'Column is required'),
}).refine((data) => {
  // If CTC range is provided, min should be less than max
  if (data.ctcMin && data.ctcMax) {
    return data.ctcMin > 0 && data.ctcMax > data.ctcMin;
  }
  // If offered CTC range is provided, min should be less than max
  if (data.offeredCtcMin && data.offeredCtcMax) {
    return data.offeredCtcMin > 0 && data.offeredCtcMax > data.offeredCtcMin;
  }
  return true;
}, {
  message: 'Invalid CTC range values',
  path: ['ctcMin'],
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  job?: Job;
  defaultColumnId?: string;
  onSuccess?: () => void;
}

export default function JobForm({ job, defaultColumnId, onSuccess }: JobFormProps) {
  const { createJob, updateJob } = useJobs();
  // Only load resumes when form is open (lazy loading)
  const { resumes = [] } = useResumes();
  const { columns = [] } = useColumns();
  const queryClient = useQueryClient();
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
          ctcMin: job.ctcMin,
          ctcMax: job.ctcMax,
          compensationFixed: job.compensationFixed,
          compensationVariables: job.compensationVariables,
          compensationRSU: job.compensationRSU,
          offeredCtcMin: job.offeredCtcMin,
          offeredCtcMax: job.offeredCtcMax,
          offeredCompensationFixed: job.offeredCompensationFixed,
          offeredCompensationVariables: job.offeredCompensationVariables,
          offeredCompensationRSU: job.offeredCompensationRSU,
          resumeVersion: job.resumeVersion || '',
          notesMarkdown: job.notesMarkdown || '',
          appliedDate: job.appliedDate
            ? format(new Date(job.appliedDate), 'yyyy-MM-dd')
            : '',
          lastWorkingDay: job.lastWorkingDay
            ? format(new Date(job.lastWorkingDay), 'yyyy-MM-dd')
            : '',
          columnId: job.columnId,
        }
      : {
          tags: [],
          columnId: defaultColumnId || '',
        },
  });

  const notesValue = watch('notesMarkdown');
  const columnId = watch('columnId');
  const selectedColumn = columns.find((col) => col._id === columnId);
  const isRecruiterCall = selectedColumn?.title.toLowerCase().includes('recruiter') || selectedColumn?.title.toLowerCase().includes('call');

  const onSubmit = async (data: JobFormData) => {
    const jobData = {
      ...data,
      jobUrl: data.jobUrl || undefined,
      ctcMin: data.ctcMin ? Number(data.ctcMin) : undefined,
      ctcMax: data.ctcMax ? Number(data.ctcMax) : undefined,
      compensationFixed: data.compensationFixed ? Number(data.compensationFixed) : undefined,
      compensationVariables: data.compensationVariables ? Number(data.compensationVariables) : undefined,
      compensationRSU: data.compensationRSU ? Number(data.compensationRSU) : undefined,
      offeredCtcMin: data.offeredCtcMin ? Number(data.offeredCtcMin) : undefined,
      offeredCtcMax: data.offeredCtcMax ? Number(data.offeredCtcMax) : undefined,
      offeredCompensationFixed: data.offeredCompensationFixed ? Number(data.offeredCompensationFixed) : undefined,
      offeredCompensationVariables: data.offeredCompensationVariables ? Number(data.offeredCompensationVariables) : undefined,
      offeredCompensationRSU: data.offeredCompensationRSU ? Number(data.offeredCompensationRSU) : undefined,
      appliedDate: data.appliedDate ? new Date(data.appliedDate).toISOString() : undefined,
      lastWorkingDay: data.lastWorkingDay ? new Date(data.lastWorkingDay).toISOString() : undefined,
    };

    try {
      if (job) {
        updateJob({ id: job._id, ...jobData }, {
          onSuccess: () => {
            // Ensure jobs are refetched
            queryClient.refetchQueries({ queryKey: ['jobs'] });
            onSuccess?.();
          },
        });
      } else {
        createJob(jobData, {
          onSuccess: () => {
            // Ensure jobs are refetched immediately
            queryClient.refetchQueries({ queryKey: ['jobs'] });
            onSuccess?.();
          },
          onError: (error) => {
            console.error('Failed to create job:', error);
          },
        });
      }
    } catch (error) {
      console.error('Error submitting job:', error);
    }
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
            <TagSelect
              value={field.value || []}
              onChange={field.onChange}
              placeholder="Click to select tags"
            />
          )}
        />
      </div>

      {/* Asked Compensation */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Asked Compensation</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ctcMin">CTC Min (₹)</Label>
            <Input id="ctcMin" {...register('ctcMin', { valueAsNumber: true })} type="number" min="0" step="1000" />
          </div>
          <div>
            <Label htmlFor="ctcMax">CTC Max (₹)</Label>
            <Input id="ctcMax" {...register('ctcMax', { valueAsNumber: true })} type="number" min="0" step="1000" />
          </div>
        </div>

        {/* Compensation Breakup */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="compensationFixed">Fixed (₹)</Label>
            <Input id="compensationFixed" {...register('compensationFixed', { valueAsNumber: true })} type="number" min="0" step="1000" />
          </div>
          <div>
            <Label htmlFor="compensationVariables">Variables/Bonus (₹)</Label>
            <Input id="compensationVariables" {...register('compensationVariables', { valueAsNumber: true })} type="number" min="0" step="1000" />
          </div>
          <div>
            <Label htmlFor="compensationRSU">RSU/Stocks (₹)</Label>
            <Input id="compensationRSU" {...register('compensationRSU', { valueAsNumber: true })} type="number" min="0" step="1000" />
          </div>
        </div>
      </div>

      {/* Offered Compensation (Conditional) */}
      {selectedColumn?.title === 'Offer' && (
        <>
          <h3 className="text-lg font-semibold mt-6">Offered Compensation</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="offeredCtcMin">Offered CTC Min (₹)</Label>
              <Input id="offeredCtcMin" {...register('offeredCtcMin', { valueAsNumber: true })} type="number" min="0" step="1000" />
            </div>
            <div>
              <Label htmlFor="offeredCtcMax">Offered CTC Max (₹)</Label>
              <Input id="offeredCtcMax" {...register('offeredCtcMax', { valueAsNumber: true })} type="number" min="0" step="1000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="offeredCompensationFixed">Offered Fixed (₹)</Label>
              <Input id="offeredCompensationFixed" {...register('offeredCompensationFixed', { valueAsNumber: true })} type="number" min="0" step="1000" />
            </div>
            <div>
              <Label htmlFor="offeredCompensationVariables">Offered Variables (₹)</Label>
              <Input id="offeredCompensationVariables" {...register('offeredCompensationVariables', { valueAsNumber: true })} type="number" min="0" step="1000" />
            </div>
            <div>
              <Label htmlFor="offeredCompensationRSU">Offered RSU/Stocks (₹)</Label>
              <Input id="offeredCompensationRSU" {...register('offeredCompensationRSU', { valueAsNumber: true })} type="number" min="0" step="1000" />
            </div>
          </div>
        </>
      )}

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
        {isRecruiterCall && (
          <div>
            <Label htmlFor="lastWorkingDay">Last Working Day</Label>
            <Input
              id="lastWorkingDay"
              {...register('lastWorkingDay')}
              type="date"
            />
          </div>
        )}
      </div>

      {job && job.stageHistory && job.stageHistory.length > 0 && (
        <div>
          <Label>Stage History</Label>
          <div className="mt-2 p-4 border rounded-md bg-muted/50 space-y-2">
            {job.appliedDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Applied Date:</span>
                <span className="text-muted-foreground">
                  {format(new Date(job.appliedDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {(() => {
              // Get current column order
              const currentColumn = columns.find((col) => col._id === job.columnId);
              const currentOrder = currentColumn?.order ?? Infinity;

              // Filter and sort: only show stages up to and including current stage, sorted by column order
              const filteredHistory = job.stageHistory
                .filter((stage) => {
                  const stageColumn = columns.find((col) => col._id === stage.columnId);
                  const stageOrder = stageColumn?.order ?? Infinity;
                  return stageOrder <= currentOrder;
                })
                .sort((a, b) => {
                  const colA = columns.find((col) => col._id === a.columnId);
                  const colB = columns.find((col) => col._id === b.columnId);
                  const orderA = colA?.order ?? Infinity;
                  const orderB = colB?.order ?? Infinity;
                  return orderA - orderB; // Sort by column order (sequence)
                });

              return filteredHistory.map((stage, idx) => {
                const column = columns.find((col) => col._id === stage.columnId);
                const isCurrentStage = job.columnId === stage.columnId;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-sm p-2 rounded ${
                      isCurrentStage ? 'bg-primary/10 border border-primary/20' : ''
                    }`}
                  >
                    <span className="font-medium">
                      {stage.columnTitle || column?.title || 'Unknown Stage'}
                      {isCurrentStage && (
                        <span className="ml-2 text-xs text-primary">(Current)</span>
                      )}
                    </span>
                    <span className="text-muted-foreground">
                      {format(new Date(stage.enteredDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

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

