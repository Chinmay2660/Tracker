import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, ExternalLink, Calendar } from 'lucide-react';
import { Job } from '../types';
import { Card } from './ui/card';
import { format } from 'date-fns';
import { useState, memo, useMemo } from 'react';
import JobForm from './JobForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { cn } from '@/lib/utils';

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  'Remote': { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
  'Hybrid': { bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300' },
  'On-site': { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
  'Startup': { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300' },
  'Big Tech': { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
  'Full-time': { bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-700 dark:text-teal-300' },
  'Part-time': { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
  'Contract': { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-300' },
  'Internship': { bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-700 dark:text-cyan-300' },
};

const DEFAULT_COLORS = [
  { bg: 'bg-slate-100 dark:bg-slate-700/50', text: 'text-slate-700 dark:text-slate-300' },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-300' },
  { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-700 dark:text-pink-300' },
];

const getTagColor = (tag: string) => {
  if (TAG_COLORS[tag]) return TAG_COLORS[tag];
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DEFAULT_COLORS[hash % DEFAULT_COLORS.length];
};

const formatCompensation = (job: Job): string | null => {
  if (job.ctcMin && job.ctcMax) {
    return `₹${(job.ctcMin / 100000).toFixed(1)}L - ₹${(job.ctcMax / 100000).toFixed(1)}L`;
  }
  if (job.compensationFixed) {
    return `₹${(job.compensationFixed / 100000).toFixed(1)}L`;
  }
  if (job.offeredCtc) {
    return `₹${(job.offeredCtc / 100000).toFixed(1)}L (Offered)`;
  }
  return null;
};

interface JobCardProps {
  job: Job;
  isDragging?: boolean;
}

function JobCard({ job, isDragging }: JobCardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: job._id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const compensation = useMemo(() => formatCompensation(job), [job]);

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="p-3 sm:p-4 cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all"
        onClick={() => setIsFormOpen(true)}
      >
        <div className="space-y-2">
          {/* Company & Role */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">{job.companyName}</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{job.role}</p>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>

          {/* Compensation */}
          {compensation && (
            <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              {compensation}
            </div>
          )}

          {/* Job URL */}
          {job.jobUrl && (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              View Posting
            </a>
          )}

          {/* Applied Date */}
          {job.appliedDate && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3 h-3" />
              Applied {format(new Date(job.appliedDate), 'MMM d, yyyy')}
            </div>
          )}

          {/* Tags */}
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {job.tags.slice(0, 3).map((tag, idx) => {
                const colors = getTagColor(tag);
                return (
                  <span
                    key={idx}
                    className={cn('px-2 py-0.5 text-xs font-medium rounded-full', colors.bg, colors.text)}
                  >
                    {tag}
                  </span>
                );
              })}
              {job.tags.length > 3 && (
                <span className="px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400">
                  +{job.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent onClose={() => setIsFormOpen(false)} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          <JobForm job={job} onSuccess={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(JobCard);
