import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, ExternalLink, Calendar } from 'lucide-react';
import { Job } from '../types';
import { Card } from './ui/card';
import { format } from 'date-fns';
import { useState, memo, useMemo, useRef, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

// Lazy load heavy dialog components - only loaded when user clicks a card
const Dialog = lazy(() => import('./ui/dialog').then(m => ({ default: m.Dialog })));
const DialogContent = lazy(() => import('./ui/dialog').then(m => ({ default: m.DialogContent })));
const DialogHeader = lazy(() => import('./ui/dialog').then(m => ({ default: m.DialogHeader })));
const DialogTitle = lazy(() => import('./ui/dialog').then(m => ({ default: m.DialogTitle })));
const JobForm = lazy(() => import('./JobForm'));

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  'Remote': { bg: 'bg-blue-500', text: 'text-white' },
  'Hybrid': { bg: 'bg-purple-500', text: 'text-white' },
  'On-site': { bg: 'bg-green-500', text: 'text-white' },
  'Startup': { bg: 'bg-orange-500', text: 'text-white' },
  'Big Tech': { bg: 'bg-red-500', text: 'text-white' },
  'Product': { bg: 'bg-pink-500', text: 'text-white' },
  'Engineering': { bg: 'bg-indigo-500', text: 'text-white' },
  'Design': { bg: 'bg-cyan-500', text: 'text-white' },
  'Marketing': { bg: 'bg-yellow-500', text: 'text-white' },
  'Sales': { bg: 'bg-teal-500', text: 'text-white' },
  'Full-time': { bg: 'bg-emerald-500', text: 'text-white' },
  'Part-time': { bg: 'bg-amber-500', text: 'text-white' },
  'Contract': { bg: 'bg-rose-500', text: 'text-white' },
  'Internship': { bg: 'bg-violet-500', text: 'text-white' },
};

const DEFAULT_COLORS = [
  { bg: 'bg-slate-500', text: 'text-white' },
  { bg: 'bg-indigo-500', text: 'text-white' },
  { bg: 'bg-pink-500', text: 'text-white' },
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
  const pointerStartPos = useRef<{ x: number; y: number } | null>(null);
  const didDrag = useRef(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: job._id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging || isSortableDragging ? 'none' : transition,
    opacity: isDragging || isSortableDragging ? 0.4 : 1,
  };

  const compensation = useMemo(() => formatCompensation(job), [job]);

  // Track if user dragged to prevent click after drag
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartPos.current = { x: e.clientX, y: e.clientY };
    didDrag.current = false;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointerStartPos.current) {
      const dx = Math.abs(e.clientX - pointerStartPos.current.x);
      const dy = Math.abs(e.clientY - pointerStartPos.current.y);
      if (dx > 5 || dy > 5) {
        didDrag.current = true;
      }
    }
    pointerStartPos.current = null;
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only open dialog if no drag occurred
    if (!didDrag.current && !isSortableDragging) {
      setIsFormOpen(true);
    }
    didDrag.current = false;
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onPointerDown={(e) => {
          handlePointerDown(e);
          listeners?.onPointerDown?.(e);
        }}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        className="p-3 sm:p-4 cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all touch-none select-none"
      >
        <div className="space-y-3">
          {/* Company & Role */}
          <div className="space-y-1">
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

          {/* Applied Date */}
          {job.appliedDate && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>Applied {format(new Date(job.appliedDate), 'MMM d, yyyy')}</span>
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

          {/* Tags */}
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
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

      {isFormOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Skeleton className="w-96 h-64 rounded-xl" />
          </div>
        }>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent onClose={() => setIsFormOpen(false)} className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Job</DialogTitle>
              </DialogHeader>
              <JobForm job={job} onSuccess={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </Suspense>
      )}
    </>
  );
}

export default memo(JobCard);
