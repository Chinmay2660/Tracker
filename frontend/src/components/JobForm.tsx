import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useJobs } from '../hooks/useJobs';
import { useResumes } from '../hooks/useResumes';
import { useColumns } from '../hooks/useColumns';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Stepper } from './ui/stepper';
import TagSelect from './TagSelect';
import { Job } from '../types';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

// Helper to convert NaN to undefined for optional number fields
const optionalNumber = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === '' || (typeof val === 'number' && isNaN(val))) {
      return undefined;
    }
    return val;
  },
  z.number().optional()
);

const jobSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  jobUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().min(1, 'Location is required'),
  tags: z.array(z.string()).default([]),
  // Asked Compensation
  ctcMin: optionalNumber,
  ctcMax: optionalNumber,
  compensationFixed: optionalNumber,
  compensationVariables: optionalNumber,
  compensationRSU: optionalNumber,
  // Offered Compensation
  offeredCtc: optionalNumber,
  offeredCompensationFixed: optionalNumber,
  offeredCompensationVariables: optionalNumber,
  offeredCompensationRSU: optionalNumber,
  resumeVersion: z.string().optional(),
  notesMarkdown: z.string().optional(),
  appliedDate: z.string().min(1, 'Applied date is required'),
  lastWorkingDay: z.string().optional(),
  columnId: z.string().min(1, 'Stage is required'),
}).refine((data) => {
  // If CTC range is provided, min should be less than max
  // Only validate if both values are provided and are valid numbers (not NaN)
  if (data.ctcMin !== undefined && data.ctcMax !== undefined && 
      !isNaN(data.ctcMin) && !isNaN(data.ctcMax) &&
      data.ctcMin > 0 && data.ctcMax > 0) {
    return data.ctcMax > data.ctcMin;
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
  const { createJob, updateJob, deleteJob } = useJobs();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
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
          offeredCtc: job.offeredCtc,
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
  const isOfferStage = selectedColumn?.title === 'Offer';

  const steps = [
    { label: 'Basic Info', description: 'Company & Role' },
    { label: 'Compensation', description: 'Salary Details' },
    { label: 'Additional', description: 'Dates & Notes' },
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        // Validate basic info
        if (!watch('companyName') || !watch('role') || !watch('location') || !watch('columnId')) {
          return false;
        }
        return true;
      case 1:
        // Compensation is optional, so always valid
        return true;
      case 2:
        // Applied date is required
        if (!watch('appliedDate')) {
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error('Please fill in all required fields', {
        description: 'Required fields are marked with *',
      });
    }
  };

  const handlePrevious = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Helper function to safely convert number values (handles NaN, null, undefined, empty strings)
  const safeNumber = (value: number | undefined | null): number | undefined => {
    if (value === undefined || value === null || (typeof value === 'number' && isNaN(value))) {
      return undefined;
    }
    if (typeof value === 'string' && value === '') {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  };

  const onSubmit = async (data: JobFormData) => {
    const jobData = {
      ...data,
      jobUrl: data.jobUrl || undefined,
      ctcMin: safeNumber(data.ctcMin),
      ctcMax: safeNumber(data.ctcMax),
      compensationFixed: safeNumber(data.compensationFixed),
      compensationVariables: safeNumber(data.compensationVariables),
      compensationRSU: safeNumber(data.compensationRSU),
      offeredCtc: safeNumber(data.offeredCtc),
      offeredCompensationFixed: safeNumber(data.offeredCompensationFixed),
      offeredCompensationVariables: safeNumber(data.offeredCompensationVariables),
      offeredCompensationRSU: safeNumber(data.offeredCompensationRSU),
      appliedDate: data.appliedDate ? new Date(data.appliedDate).toISOString() : undefined,
      lastWorkingDay: data.lastWorkingDay ? new Date(data.lastWorkingDay).toISOString() : undefined,
    };

    try {
      if (job?._id) {
        updateJob({ id: job._id, ...jobData }, {
          onSuccess: () => {
            // Cache is already updated optimistically, just call onSuccess
            onSuccess?.();
          },
          onError: (error: any) => {
            const errorMessage = error?.response?.data?.message ?? error?.message ?? 'An unexpected error occurred';
            toast.error('Failed to update job', {
              description: errorMessage,
            });
          },
        });
      } else {
        createJob(jobData, {
          onSuccess: () => {
            // Cache is already updated optimistically, just call onSuccess
            onSuccess?.();
          },
          onError: (error: any) => {
            const errorMessage = error?.response?.data?.message ?? error?.message ?? 'An unexpected error occurred';
            toast.error('Failed to create job', {
              description: errorMessage,
            });
          },
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message ?? error?.message ?? 'An unexpected error occurred';
      toast.error('Failed to submit job', {
        description: errorMessage,
      });
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Stepper */}
      <div className="mb-6">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step <= currentStep || validateStep(step - 1)) {
              setCurrentStep(step);
            }
          }}
        />
      </div>

      {/* Step 0: Basic Information */}
      {currentStep === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {!defaultColumnId && (
            <div>
              <Label htmlFor="columnId">Stage *</Label>
              <Select
                id="columnId"
                {...register('columnId')}
                className={errors.columnId ? 'border-destructive' : ''}
              >
                <option value="">Select a stage</option>
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
        </div>
      )}

      {/* Step 1: Compensation */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Asked Compensation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Asked Compensation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          {isOfferStage && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Offered Compensation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="offeredCtc">Offered CTC (₹)</Label>
                  <Input id="offeredCtc" {...register('offeredCtc', { valueAsNumber: true })} type="number" min="0" step="1000" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="offeredCompensationFixed">Offered Fixed (₹)</Label>
                  <Input id="offeredCompensationFixed" {...register('offeredCompensationFixed', { valueAsNumber: true })} type="number" min="0" step="1000" />
                </div>
                <div>
                  <Label htmlFor="offeredCompensationVariables">Offered Variables/Bonus (₹)</Label>
                  <Input id="offeredCompensationVariables" {...register('offeredCompensationVariables', { valueAsNumber: true })} type="number" min="0" step="1000" />
                </div>
                <div>
                  <Label htmlFor="offeredCompensationRSU">Offered RSU/Stocks (₹)</Label>
                  <Input id="offeredCompensationRSU" {...register('offeredCompensationRSU', { valueAsNumber: true })} type="number" min="0" step="1000" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Additional Details */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <Label htmlFor="appliedDate">Applied Date *</Label>
          <Input
            id="appliedDate"
            {...register('appliedDate')}
            type="date"
            className={errors.appliedDate ? 'border-destructive' : ''}
          />
          {errors.appliedDate && (
            <p className="text-sm text-destructive mt-1">
              {errors.appliedDate.message}
            </p>
          )}
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
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center gap-2">
          {job && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Job
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNext(e);
              }}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {job ? 'Update' : 'Create'} Job
            </Button>
          )}
        </div>
      </div>
    </form>

    {/* Delete Confirmation Dialog */}
    {job && (
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent onClose={() => setIsDeleteDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{job.companyName} - {job.role}"? This will also delete all related interviews. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!job?._id) {
                  toast.error('Invalid job data', {
                    description: 'Cannot delete job with missing information.',
                  });
                  return;
                }
                deleteJob(job._id, {
                  onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    onSuccess?.();
                  },
                  onError: (error: any) => {
                    const errorMessage = error?.response?.data?.message ?? error?.message ?? 'An unexpected error occurred';
                    toast.error('Failed to delete job', {
                      description: errorMessage,
                    });
                  },
                });
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )}
  </>
  );
}

