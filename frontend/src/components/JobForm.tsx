import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useJobs } from '../hooks/useJobs';
import { useResumes } from '../hooks/useResumes';
import { useColumns } from '../hooks/useColumns';
import { useHrContacts } from '../hooks/useHrContacts';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Stepper } from './ui/stepper';
import TagSelect from './TagSelect';
import AddStageDialog from './AddStageDialog';
import { HrContactRecord, Job } from '../types';
import { formatHrContactCompanyDisplay } from '../lib/hrContactDisplay';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Trash2, ChevronLeft, ChevronRight, Plus, X, Search } from 'lucide-react';
const optionalNumber = z.preprocess((val) => {
    if (val === undefined || val === null || val === '' || (typeof val === 'number' && isNaN(val))) {
        return undefined;
    }
    return val;
}, z.number().optional());
const hrContactSchema = z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
});
const INTERVIEW_STAGE_STATUSES = [
    'Pending',
    'Scheduled',
    'Cleared',
    'Rejected',
    'Shortlisted',
    'Pending Results',
    'Abandoned by HR',
    'Back Off',
    'Budget Issue',
    'Notice Period Issue',
    'No Offer',
    'Position Closed',
    'Position On Hold',
    'Offer Received',
    'Offer Accepted',
    'Offer Declined',
] as const;
const interviewStageSchema = z.object({
    stageId: z.string(),
    stageName: z.string().optional(),
    status: z.enum(INTERVIEW_STAGE_STATUSES).default('Pending'),
    date: z.string().optional(),
    order: z.number(),
});
const jobSchema = z.object({
    companyName: z.string().min(1, 'Company name is required'),
    role: z.string().min(1, 'Role is required'),
    jobUrl: z.string().url().optional().or(z.literal('')),
    location: z.string().min(1, 'Location is required'),
    tags: z.array(z.string()).default([]),
    ctcMin: optionalNumber,
    ctcMax: optionalNumber,
    compensationFixed: optionalNumber,
    compensationVariables: optionalNumber,
    compensationRSU: optionalNumber,
    offeredCtc: optionalNumber,
    offeredCompensationFixed: optionalNumber,
    offeredCompensationVariables: optionalNumber,
    offeredCompensationRSU: optionalNumber,
    resumeVersion: z.string().optional(),
    notesMarkdown: z.string().optional(),
    appliedDate: z.string().min(1, 'Applied date is required'),
    lastWorkingDay: z.string().optional(),
    interviewStages: z.array(interviewStageSchema).min(1, 'At least one interview stage is required'),
    hrContacts: z.array(hrContactSchema).default([]),
}).refine((data) => {
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
function filterHrDirectoryContacts(contacts: HrContactRecord[], query: string): HrContactRecord[] {
    const q = query.trim().toLowerCase();
    if (!q)
        return contacts;
    return contacts.filter((c) => {
        const hay = `${c.companyName ?? ''} ${c.intermediaryCompanyName ?? ''} ${c.hrName} ${c.phone} ${c.email ?? ''}`.toLowerCase();
        return hay.includes(q);
    });
}
interface JobFormProps {
    job?: Job;
    defaultColumnId?: string;
    onSuccess?: () => void;
}
export default function JobForm({ job, defaultColumnId, onSuccess }: JobFormProps) {
    const { createJob, updateJob, deleteJob } = useJobs();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isAddStageOpen, setIsAddStageOpen] = useState(false);
    const [isDateEditOpen, setIsDateEditOpen] = useState(false);
    const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);
    const [editingStageDate, setEditingStageDate] = useState('');
    const { resumes = [] } = useResumes();
    const { columns = [] } = useColumns();
    const { hrContacts = [], isLoading: hrDirectoryLoading } = useHrContacts();
    const queryClient = useQueryClient();
    const [hrDirectorySearch, setHrDirectorySearch] = useState<Record<number, string>>({});
    const appliedColumn = columns.find((col) => col.title.toLowerCase() === 'applied');
    const defaultAppliedColumnId = defaultColumnId || appliedColumn?._id || '';
    const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
    const getDefaultInterviewStages = () => {
        if (job?.interviewStages && job.interviewStages.length > 0) {
            return job.interviewStages.map(stage => ({
                stageId: stage.stageId,
                stageName: stage.stageName || columns.find(c => c._id === stage.stageId)?.title || '',
                status: stage.status,
                date: stage.date ? format(new Date(stage.date), 'yyyy-MM-dd') : '',
                order: stage.order,
            }));
        }
        const appliedCol = columns.find(c => c.title.toLowerCase() === 'applied') || columns[0];
        if (appliedCol) {
            return [{
                    stageId: defaultColumnId || appliedCol._id,
                    stageName: appliedCol.title,
                    status: 'Pending' as const,
                    date: format(new Date(), 'yyyy-MM-dd'),
                    order: 0,
                }];
        }
        return [];
    };
    const { register, handleSubmit, watch, control, trigger, setValue, formState: { errors, isSubmitting }, } = useForm<JobFormData>({
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
                interviewStages: getDefaultInterviewStages(),
                hrContacts: job.hrContacts || [],
            }
            : {
                tags: [],
                interviewStages: getDefaultInterviewStages(),
                hrContacts: [],
                appliedDate: format(new Date(), 'yyyy-MM-dd'),
            },
    });
    const { fields: hrContactFields, append: appendHRContact, remove: removeHRContact } = useFieldArray({
        control,
        name: 'hrContacts',
    });
    const { fields: interviewStageFields, append: appendStage, remove: removeStage, move: moveStage } = useFieldArray({
        control,
        name: 'interviewStages',
    });
    const notesValue = watch('notesMarkdown');
    const interviewStages = watch('interviewStages') || [];
    const appliedDateValue = watch('appliedDate');
    const isUpdatingRef = useRef(false);
    const appliedStageIndex = interviewStages.findIndex(s => s.stageName?.toLowerCase() === 'applied');
    const appliedStageDate = appliedStageIndex >= 0 ? interviewStages[appliedStageIndex]?.date : '';
    useEffect(() => {
        if (isUpdatingRef.current)
            return;
        if (appliedStageIndex >= 0 && appliedStageDate && appliedStageDate !== appliedDateValue) {
            isUpdatingRef.current = true;
            setValue('appliedDate', appliedStageDate);
            setTimeout(() => { isUpdatingRef.current = false; }, 0);
        }
    }, [appliedStageDate, appliedStageIndex, appliedDateValue, setValue]);
    useEffect(() => {
        if (isUpdatingRef.current)
            return;
        if (appliedStageIndex >= 0 && appliedDateValue && appliedDateValue !== appliedStageDate) {
            isUpdatingRef.current = true;
            setValue(`interviewStages.${appliedStageIndex}.date`, appliedDateValue);
            setTimeout(() => { isUpdatingRef.current = false; }, 0);
        }
    }, [appliedDateValue, appliedStageIndex, appliedStageDate, setValue]);
    const getFurthestStageId = () => {
        if (interviewStages.length === 0)
            return '';
        const sortedStages = [...interviewStages].sort((a, b) => a.order - b.order);
        return sortedStages[sortedStages.length - 1]?.stageId || '';
    };
    const currentColumnId = getFurthestStageId();
    const selectedColumn = columns.find((col) => col._id === currentColumnId);
    const isRecruiterCall = selectedColumn?.title.toLowerCase().includes('recruiter') || selectedColumn?.title.toLowerCase().includes('call');
    const isOfferStage = selectedColumn?.title === 'Offer';
    const handleAddStage = (stageId: string) => {
        const column = columns.find(c => c._id === stageId);
        if (!column)
            return;
        const exists = interviewStages.some(s => s.stageId === stageId);
        if (exists)
            return;
        const maxOrder = Math.max(...interviewStages.map(s => s.order), -1);
        appendStage({
            stageId,
            stageName: column.title,
            status: 'Pending',
            date: '',
            order: maxOrder + 1,
        });
    };
    const handleMoveUp = (index: number) => {
        if (index > 0) {
            moveStage(index, index - 1);
            const stages = [...interviewStages];
            stages.forEach((s, i) => setValue(`interviewStages.${i}.order`, i));
            setEditingStageIndex(index - 1);
            setEditingStageDate(interviewStages[index]?.date || format(new Date(), 'yyyy-MM-dd'));
            setIsDateEditOpen(true);
        }
    };
    const handleMoveDown = (index: number) => {
        if (index < interviewStages.length - 1) {
            moveStage(index, index + 1);
            const stages = [...interviewStages];
            stages.forEach((s, i) => setValue(`interviewStages.${i}.order`, i));
            setEditingStageIndex(index + 1);
            setEditingStageDate(interviewStages[index]?.date || format(new Date(), 'yyyy-MM-dd'));
            setIsDateEditOpen(true);
        }
    };
    const handleSaveStageDate = () => {
        if (editingStageIndex !== null) {
            setValue(`interviewStages.${editingStageIndex}.date`, editingStageDate);
            setIsDateEditOpen(false);
            setEditingStageIndex(null);
            setEditingStageDate('');
        }
    };
    const steps = [
        { label: 'Basic Details' },
        { label: 'Interview Stages' },
        { label: 'HR Contacts' },
        { label: 'Compensation' },
        { label: 'Additional' },
    ];
    const stepFields: Record<number, (keyof JobFormData)[]> = {
        0: ['companyName', 'role', 'location'],
        1: ['interviewStages'],
        2: [],
        3: [],
        4: ['appliedDate'],
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
        const filteredHRContacts = (data.hrContacts || []).filter((contact) => contact.name || contact.phone || contact.email);
        const sortedStages = [...(data.interviewStages || [])].sort((a, b) => a.order - b.order);
        const columnId = sortedStages.length > 0 ? sortedStages[sortedStages.length - 1].stageId : '';
        if (!columnId) {
            toast.error('Please add at least one interview stage');
            return;
        }
        const processedStages = sortedStages.map((stage, index) => ({
            ...stage,
            order: index,
            date: stage.date || undefined,
        }));
        const jobData = {
            ...data,
            columnId,
            interviewStages: processedStages,
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
                        onSuccess?.();
                    },
                    onError: (error: any) => {
                        const errorMessage = error?.response?.data?.message ?? error?.message ?? 'An unexpected error occurred';
                        toast.error('Failed to update job', {
                            description: errorMessage,
                        });
                    },
                });
            }
            else {
                createJob(jobData, {
                    onSuccess: () => {
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
        }
        catch (error: any) {
            const errorMessage = error?.response?.data?.message ?? error?.message ?? 'An unexpected error occurred';
            toast.error('Failed to submit job', {
                description: errorMessage,
            });
        }
    };
    return (<>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      <div className="mb-6">
        <Stepper steps={steps} currentStep={currentStep} onStepClick={async (step) => {
            if (step <= currentStep) {
                setCurrentStep(step);
            }
            else {
                const fieldsToValidate = stepFields[currentStep] || [];
                const isValid = fieldsToValidate.length === 0 || await trigger(fieldsToValidate);
                if (isValid) {
                    setCurrentStep(step);
                }
            }
        }}/>
      </div>

      
      {currentStep === 0 && (<div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="companyName">Company Name *</Label>
          <Input id="companyName" {...register('companyName')} className={errors.companyName ? 'border-destructive' : ''}/>
          {errors.companyName && (<p className="text-sm text-destructive mt-1">
              {errors.companyName.message}
            </p>)}
        </div>
        <div>
          <Label htmlFor="role">Role *</Label>
          <Input id="role" {...register('role')} className={errors.role ? 'border-destructive' : ''}/>
          {errors.role && (<p className="text-sm text-destructive mt-1">{errors.role.message}</p>)}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="jobUrl">Job URL</Label>
          <Input id="jobUrl" {...register('jobUrl')} type="url"/>
        </div>
        <div>
          <Label htmlFor="location">Location *</Label>
          <Input id="location" {...register('location')} className={errors.location ? 'border-destructive' : ''} placeholder="e.g., San Francisco, CA or Remote"/>
          {errors.location && (<p className="text-sm text-destructive mt-1">
              {errors.location.message}
            </p>)}
        </div>
      </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Controller name="tags" control={control} render={({ field }) => (<TagSelect value={field.value || []} onChange={field.onChange} placeholder="Click to select tags"/>)}/>
          </div>

        </div>)}

      
      {currentStep === 1 && (<div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Interview Stages</h3>
              <p className="text-sm text-muted-foreground">Track your interview progression. Drag to reorder.</p>
            </div>
          </div>

          
          <div className="flex items-stretch gap-2">
            <Select className="flex-1" onChange={(e) => {
                if (e.target.value) {
                    handleAddStage(e.target.value);
                    e.target.value = '';
                }
            }}>
              <option value="">+ Add interview stage...</option>
              {sortedColumns
                .filter(col => !interviewStages.some(s => s.stageId === col._id))
                .map(col => (<option key={col._id} value={col._id}>{col.title}</option>))}
            </Select>
            <Button type="button" variant="outline" onClick={() => setIsAddStageOpen(true)} className="shrink-0 h-[44px] w-[44px] p-0">
              <Plus className="w-5 h-5"/>
            </Button>
          </div>

          
          {interviewStageFields.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-8">No interview stages added yet.</p>) : (<div className="space-y-3">
              {interviewStageFields.map((field, index) => {
                    const column = columns.find(c => c._id === field.stageId);
                    const isAppliedStage = field.stageName?.toLowerCase() === 'applied';
                    return (<div key={field.id} className="p-3 border rounded-lg bg-muted/30 space-y-3" style={{ borderLeftWidth: 4, borderLeftColor: column?.color || '#14b8a6' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        
                        {!isAppliedStage ? (<div className="flex flex-col gap-0.5">
                            <button type="button" onClick={() => handleMoveUp(index)} disabled={index === 0 || interviewStageFields[index - 1]?.stageName?.toLowerCase() === 'applied'} className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30">
                              <ChevronLeft className="w-4 h-4 rotate-90"/>
                            </button>
                            <button type="button" onClick={() => handleMoveDown(index)} disabled={index === interviewStageFields.length - 1} className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30">
                              <ChevronRight className="w-4 h-4 rotate-90"/>
                            </button>
                          </div>) : (<div className="w-5"/>)}
                        <span className="px-2 py-1 text-sm font-medium rounded text-white" style={{ backgroundColor: column?.color || '#14b8a6' }}>
                          {field.stageName || column?.title || 'Unknown'}
                        </span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeStage(index)} disabled={interviewStageFields.length === 1} className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <X className="w-4 h-4"/>
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <Label className="text-xs">Status</Label>
                        <Select {...register(`interviewStages.${index}.status`)} className="min-h-[36px] py-1.5 text-sm">
                          {INTERVIEW_STAGE_STATUSES.map(status => (<option key={status} value={status}>{status}</option>))}
                        </Select>
                      </div>
                      <div className="min-w-0">
                        <Label className="text-xs">Date</Label>
                        <Input type="date" {...register(`interviewStages.${index}.date`)} className="h-[36px] py-1.5 text-sm"/>
                      </div>
                    </div>
                    <input type="hidden" {...register(`interviewStages.${index}.stageId`)}/>
                    <input type="hidden" {...register(`interviewStages.${index}.stageName`)}/>
                    <input type="hidden" {...register(`interviewStages.${index}.order`)} value={index}/>
                  </div>);
                })}
            </div>)}

          {errors.interviewStages && (<p className="text-sm text-destructive">
              {errors.interviewStages.message || 'At least one interview stage is required'}
            </p>)}
        </div>)}

      
      {currentStep === 2 && (<div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">HR/Recruiter Contacts</h3>
              <p className="text-sm text-muted-foreground">
                Search saved contacts from{' '}
                <Link to="/dashboard/hr-contacts" className="text-teal-600 dark:text-teal-400 underline-offset-2 hover:underline">
                  HR Contacts
                </Link>{' '}
                to fill name, phone, and email, or type them manually.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => appendHRContact({ name: '', phone: '', email: '' })} className="gap-1">
              <Plus className="w-3 h-3"/>
              Add HR
            </Button>
          </div>
          {hrContactFields.length === 0 && (<div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
              <p className="text-muted-foreground">No HR contacts added yet</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add HR" to add recruiter details</p>
            </div>)}
          {hrContactFields.map((field, index) => {
                const searchQ = hrDirectorySearch[index] ?? '';
                const filteredDirectory = filterHrDirectoryContacts(hrContacts, searchQ);
                const applyHrFromDirectory = (c: HrContactRecord) => {
                    setValue(`hrContacts.${index}.name`, c.hrName);
                    setValue(`hrContacts.${index}.phone`, c.phone);
                    setValue(`hrContacts.${index}.email`, c.email ?? '');
                    void trigger([
                        `hrContacts.${index}.name`,
                        `hrContacts.${index}.phone`,
                        `hrContacts.${index}.email`,
                    ] as const);
                    setHrDirectorySearch((prev) => ({ ...prev, [index]: '' }));
                };
                return (<div key={field.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">HR #{index + 1}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeHRContact(index)} className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <X className="w-4 h-4"/>
                </Button>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/40 p-3 space-y-2">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">Pick from HR Contacts</Label>
                {hrDirectoryLoading ? (<p className="text-xs text-muted-foreground">Loading saved contacts…</p>) : hrContacts.length === 0 ? (<p className="text-xs text-muted-foreground">
                    No contacts in your directory yet. Add them under the HR Contacts tab, then search here.
                  </p>) : (<>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"/>
                      <Input type="search" autoComplete="off" placeholder="Search by company, name, phone, or email…" value={searchQ} onChange={(e) => setHrDirectorySearch((prev) => ({ ...prev, [index]: e.target.value }))} className="pl-9 h-9 text-sm"/>
                    </div>
                    {filteredDirectory.length > 0 ? (<ul className="max-h-40 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-600 divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900 text-sm" role="listbox">
                        {filteredDirectory.map((c) => (<li key={c._id}>
                            <button type="button" role="option" className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => applyHrFromDirectory(c)}>
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {formatHrContactCompanyDisplay(c)}
                              </span>
                              <span className="text-slate-600 dark:text-slate-400">
                                {' '}
                                — {c.hrName?.trim() || '—'}
                              </span>
                              <span className="block text-xs text-muted-foreground mt-0.5 tabular-nums">
                                {c.phone?.trim() || '—'}
                                {c.email ? ` · ${c.email}` : ''}
                              </span>
                            </button>
                          </li>))}
                      </ul>) : searchQ.trim() ? (<p className="text-xs text-muted-foreground">No matches. Try another search.</p>) : (<p className="text-xs text-muted-foreground">
                        Showing all {hrContacts.length} contact(s). Type to filter.
                      </p>)}
                  </>)}
              </div>

              <p className="text-xs text-muted-foreground">Or enter manually:</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label htmlFor={`hrContacts.${index}.name`} className="text-sm w-16 flex-shrink-0">Name</Label>
                  <Input id={`hrContacts.${index}.name`} {...register(`hrContacts.${index}.name`)} placeholder="HR Name"/>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor={`hrContacts.${index}.phone`} className="text-sm w-16 flex-shrink-0">Phone</Label>
                  <Input id={`hrContacts.${index}.phone`} {...register(`hrContacts.${index}.phone`)} placeholder="+91 9876543210"/>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor={`hrContacts.${index}.email`} className="text-sm w-16 flex-shrink-0">Email</Label>
                  <Input id={`hrContacts.${index}.email`} {...register(`hrContacts.${index}.email`)} type="email" placeholder="hr@company.com"/>
                </div>
              </div>
            </div>);
            })}
        </div>)}

      
      {currentStep === 3 && (<div className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Asked Compensation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ctcMin">CTC Min (₹)</Label>
                <Input id="ctcMin" {...register('ctcMin', { valueAsNumber: true })} type="number" min="0" step="1000"/>
              </div>
              <div>
                <Label htmlFor="ctcMax">CTC Max (₹)</Label>
                <Input id="ctcMax" {...register('ctcMax', { valueAsNumber: true })} type="number" min="0" step="1000"/>
              </div>
            </div>

            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="compensationFixed">Fixed (₹)</Label>
                <Input id="compensationFixed" {...register('compensationFixed', { valueAsNumber: true })} type="number" min="0" step="1000"/>
              </div>
              <div>
                <Label htmlFor="compensationVariables">Variables/Bonus (₹)</Label>
                <Input id="compensationVariables" {...register('compensationVariables', { valueAsNumber: true })} type="number" min="0" step="1000"/>
              </div>
              <div>
                <Label htmlFor="compensationRSU">RSU/Stocks (₹)</Label>
                <Input id="compensationRSU" {...register('compensationRSU', { valueAsNumber: true })} type="number" min="0" step="1000"/>
              </div>
            </div>
          </div>

          
          {isOfferStage && (<div className="space-y-4">
              <h3 className="text-lg font-semibold">Offered Compensation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="offeredCtc">Offered CTC (₹)</Label>
                  <Input id="offeredCtc" {...register('offeredCtc', { valueAsNumber: true })} type="number" min="0" step="1000"/>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="offeredCompensationFixed">Offered Fixed (₹)</Label>
                  <Input id="offeredCompensationFixed" {...register('offeredCompensationFixed', { valueAsNumber: true })} type="number" min="0" step="1000"/>
                </div>
                <div>
                  <Label htmlFor="offeredCompensationVariables">Offered Variables/Bonus (₹)</Label>
                  <Input id="offeredCompensationVariables" {...register('offeredCompensationVariables', { valueAsNumber: true })} type="number" min="0" step="1000"/>
                </div>
                <div>
                  <Label htmlFor="offeredCompensationRSU">Offered RSU/Stocks (₹)</Label>
                  <Input id="offeredCompensationRSU" {...register('offeredCompensationRSU', { valueAsNumber: true })} type="number" min="0" step="1000"/>
                </div>
              </div>
            </div>)}
        </div>)}

      
      {currentStep === 4 && (<div className="space-y-4 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <Label htmlFor="resumeVersion">Resume Version</Label>
              <Select id="resumeVersion" {...register('resumeVersion')}>
                <option value="">None</option>
                {resumes.map((resume) => (<option key={resume._id} value={resume._id}>
                    {resume.name}
                  </option>))}
              </Select>
            </div>
            <div className="min-w-0">
              <Label htmlFor="appliedDate">Applied Date *</Label>
              <Input id="appliedDate" {...register('appliedDate')} type="date" className={errors.appliedDate ? 'border-destructive' : ''}/>
              {errors.appliedDate && (<p className="text-sm text-destructive mt-1">
                  {errors.appliedDate.message}
                </p>)}
            </div>
            {isRecruiterCall && (<div className="min-w-0">
                <Label htmlFor="lastWorkingDay">Last Working Day</Label>
                <Input id="lastWorkingDay" {...register('lastWorkingDay')} type="date"/>
              </div>)}
          </div>

          
          {interviewStages && interviewStages.length > 0 && (<div>
              <Label>Interview Progress</Label>
              <div className="mt-2 p-4 border rounded-md bg-muted/50 space-y-2">
                {[...interviewStages]
                    .sort((a, b) => a.order - b.order)
                    .map((stage, idx) => {
                    const getStatusStyle = (status: string) => {
                        switch (status) {
                            case 'Cleared':
                            case 'Offer Received':
                            case 'Offer Accepted':
                                return 'text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
                            case 'Rejected':
                            case 'No Offer':
                            case 'Offer Declined':
                                return 'text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20';
                            case 'Scheduled':
                            case 'Shortlisted':
                                return 'text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20';
                            case 'Pending':
                            case 'Pending Results':
                                return 'text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20';
                            default:
                                return 'text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/20';
                        }
                    };
                    return (<div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-background/50">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{stage.stageName || 'Unknown Stage'}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusStyle(stage.status)}`}>
                            {stage.status}
                          </span>
                        </div>
                        {stage.date && (<span className="text-muted-foreground">
                            {format(new Date(stage.date), 'MMM d, yyyy')}
                          </span>)}
                      </div>);
                })}
              </div>
            </div>)}

          <div>
            <Label htmlFor="notesMarkdown">Notes (Markdown)</Label>
            <Textarea id="notesMarkdown" {...register('notesMarkdown')} rows={6} className="font-mono text-sm"/>
            {notesValue && (<div className="mt-2 p-4 border rounded-md bg-muted/50">
                <p className="text-sm font-semibold mb-2">Preview:</p>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{notesValue}</ReactMarkdown>
                </div>
              </div>)}
          </div>
        </div>)}

      
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t">
        
        {job && (<Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="gap-2 order-1">
            <Trash2 className="h-4 w-4"/>
            Delete Job
          </Button>)}
        
        
        {currentStep > 0 && (<Button type="button" variant="outline" onClick={handlePrevious} className="gap-2 order-2 sm:ml-auto">
            <ChevronLeft className="h-4 w-4"/>
            Previous
          </Button>)}
        
        
        {currentStep < steps.length - 1 ? (<Button type="button" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNext(e);
            }} className={`gap-2 order-3 ${currentStep === 0 && !job ? 'sm:ml-auto' : ''}`}>
            Next
            <ChevronRight className="h-4 w-4"/>
          </Button>) : (<Button type="submit" disabled={isSubmitting} className={`order-3 ${!job ? 'sm:ml-auto' : ''}`}>
            {job ? 'Update' : 'Create'} Job
          </Button>)}
      </div>
    </form>

    
    {job && (<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent onClose={() => setIsDeleteDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{job.companyName} - {job.role}"? This will also delete all related interviews. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
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
            }}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>)}

    
    <AddStageDialog open={isAddStageOpen} onOpenChange={setIsAddStageOpen}/>
    
    
    <Dialog open={isDateEditOpen} onOpenChange={setIsDateEditOpen}>
      <DialogContent onClose={() => setIsDateEditOpen(false)} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Stage Date</DialogTitle>
          <DialogDescription>
            Set the date for this interview stage.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {editingStageIndex !== null && interviewStages[editingStageIndex] && (<div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium text-sm">
                {interviewStages[editingStageIndex]?.stageName || 'Interview Stage'}
              </p>
            </div>)}
          <div className="space-y-2">
            <Label htmlFor="stage-date">Date</Label>
            <Input id="stage-date" type="date" value={editingStageDate} onChange={(e) => setEditingStageDate(e.target.value)}/>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => {
            setIsDateEditOpen(false);
            setEditingStageIndex(null);
        }} className="flex-1">
              Skip
            </Button>
            <Button type="button" onClick={handleSaveStageDate} className="flex-1">
              Save Date
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>);
}
