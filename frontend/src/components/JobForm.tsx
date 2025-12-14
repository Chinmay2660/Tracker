import { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
import { Trash2, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

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

const hrContactSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

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
  hrContacts: z.array(hrContactSchema).default([]),
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
  
  // Find "Applied" column for default
  const appliedColumn = columns.find((col) => col.title.toLowerCase() === 'applied');
  const defaultAppliedColumnId = defaultColumnId || appliedColumn?._id || '';
  
  const {
    register,
    handleSubmit,
    watch,
    control,
    trigger,
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
          hrContacts: job.hrContacts || [],
        }
      : {
          tags: [],
          columnId: defaultAppliedColumnId,
          hrContacts: [],
        },
  });

  const { fields: hrContactFields, append: appendHRContact, remove: removeHRContact } = useFieldArray({
    control,
    name: 'hrContacts',
  });

  const notesValue = watch('notesMarkdown');
  const columnId = watch('columnId');
  const selectedColumn = columns.find((col) => col._id === columnId);
  const isRecruiterCall = selectedColumn?.title.toLowerCase().includes('recruiter') || selectedColumn?.title.toLowerCase().includes('call');
  const isOfferStage = selectedColumn?.title === 'Offer';

  const steps = [
    { label: 'Basic Details' },
    { label: 'HR Contact Details' },
    { label: 'Compensation Details' },
    { label: 'Additional Details' },
  ];

  // Fields to validate for each step
  const stepFields: Record<number, (keyof JobFormData)[]> = {
    0: ['companyName', 'role', 'location', 'columnId'],
    1: [], // HR contacts are optional
    2: [], // Compensation is optional
    3: ['appliedDate'],
  };

  const handleNext = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    const fieldsToValidate = stepFields[currentStep] || [];
    const isValid = fieldsToValidate.length === 0 || await trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
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
    // Filter out empty HR contacts
    const filteredHRContacts = (data.hrContacts || []).filter(
      (contact) => contact.name || contact.phone || contact.email
    );

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
      hrContacts: filteredHRContacts,
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
          onStepClick={async (step) => {
            if (step <= currentStep) {
              setCurrentStep(step);
            } else {
              // Validate current step before moving forward
              const fieldsToValidate = stepFields[currentStep] || [];
              const isValid = fieldsToValidate.length === 0 || await trigger(fieldsToValidate);
              if (isValid) {
                setCurrentStep(step);
              }
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

      {/* Step 1: HR Contacts */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">HR/Recruiter Contacts</h3>
              <p className="text-sm text-muted-foreground">Add contact details for HR or recruiters</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendHRContact({ name: '', phone: '', email: '' })}
              className="gap-1"
            >
              <Plus className="w-3 h-3" />
              Add HR
            </Button>
          </div>
          {hrContactFields.length === 0 && (
            <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
              <p className="text-muted-foreground">No HR contacts added yet</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add HR" to add recruiter details</p>
            </div>
          )}
          {hrContactFields.map((field, index) => (
            <div key={field.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">HR #{index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHRContact(index)}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label htmlFor={`hrContacts.${index}.name`} className="text-sm w-16 flex-shrink-0">Name</Label>
                  <Input
                    id={`hrContacts.${index}.name`}
                    {...register(`hrContacts.${index}.name`)}
                    placeholder="HR Name"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor={`hrContacts.${index}.phone`} className="text-sm w-16 flex-shrink-0">Phone</Label>
                  <Input
                    id={`hrContacts.${index}.phone`}
                    {...register(`hrContacts.${index}.phone`)}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor={`hrContacts.${index}.email`} className="text-sm w-16 flex-shrink-0">Email</Label>
                  <Input
                    id={`hrContacts.${index}.email`}
                    {...register(`hrContacts.${index}.email`)}
                    type="email"
                    placeholder="hr@company.com"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Compensation */}
      {currentStep === 2 && (
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

      {/* Step 3: Additional Details */}
      {currentStep === 3 && (
        <div className="space-y-4 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
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
            <div className="min-w-0">
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
              <div className="min-w-0">
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
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t">
        {/* Delete button */}
        {job && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="gap-2 order-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete Job
          </Button>
        )}
        
        {/* Previous button */}
        {currentStep > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            className="gap-2 order-2 sm:ml-auto"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
        )}
        
        {/* Next/Submit button */}
        {currentStep < steps.length - 1 ? (
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext(e);
            }}
            className={`gap-2 order-3 ${currentStep === 0 && !job ? 'sm:ml-auto' : ''}`}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting} className={`order-3 ${!job ? 'sm:ml-auto' : ''}`}>
            {job ? 'Update' : 'Create'} Job
          </Button>
        )}
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

