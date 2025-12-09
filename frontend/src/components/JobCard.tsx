import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, ExternalLink, Calendar } from 'lucide-react';
import { Job } from '../types';
import { Card } from './ui/card';
import { format } from 'date-fns';
import { useState, memo } from 'react';
import JobForm from './JobForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { cn } from '@/lib/utils';

// Color palette matching TagAutocomplete
const COLOR_PALETTE = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
];

const PREDEFINED_TAG_COLORS: Record<string, string> = {
  'Remote': 'bg-blue-500',
  'Hybrid': 'bg-purple-500',
  'On-site': 'bg-green-500',
  'Startup': 'bg-orange-500',
  'Big Tech': 'bg-red-500',
  'Product': 'bg-pink-500',
  'Engineering': 'bg-indigo-500',
  'Design': 'bg-cyan-500',
  'Marketing': 'bg-yellow-500',
  'Sales': 'bg-teal-500',
  'Full-time': 'bg-emerald-500',
  'Part-time': 'bg-amber-500',
  'Contract': 'bg-rose-500',
  'Internship': 'bg-violet-500',
};

const getTagColor = (tagLabel: string): string => {
  const predefined = PREDEFINED_TAG_COLORS[tagLabel];
  if (predefined) return predefined;
  
  // Assign color based on hash of tag name for consistency
  const hash = tagLabel.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLOR_PALETTE[hash % COLOR_PALETTE.length];
};

const formatCompensation = (job: Job): string | null => {
  // Display asked CTC range
  if (job.ctcMin && job.ctcMax) {
    return `₹${(job.ctcMin / 100000).toFixed(1)} L - ₹${(job.ctcMax / 100000).toFixed(1)} L (CTC)`;
  }
  // Display fixed compensation
  if (job.compensationFixed) {
    return `₹${(job.compensationFixed / 100000).toFixed(1)} L (Fixed)`;
  }
  // Display offered CTC range if available
  if (job.offeredCtcMin && job.offeredCtcMax) {
    return `₹${(job.offeredCtcMin / 100000).toFixed(1)} L - ₹${(job.offeredCtcMax / 100000).toFixed(1)} L (Offered CTC)`;
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
  } = useSortable({
    id: job._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const compensationText = formatCompensation(job);

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
        onClick={() => setIsFormOpen(true)}
      >
        <div className="space-y-2">
          <div>
            <h4 className="font-semibold text-lg">{job.companyName}</h4>
            <p className="text-sm text-muted-foreground">{job.role}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {job.location}
          </div>
          {compensationText && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {compensationText}
            </div>
          )}
          {job.jobUrl && (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View Job Posting
            </a>
          )}
          {job.appliedDate && (
            <div 
              className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsFormOpen(true);
              }}
            >
              <Calendar className="h-3 w-3" />
              Applied: {format(new Date(job.appliedDate), 'MMM d, yyyy')}
            </div>
          )}
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.tags.map((tag, idx) => {
                const color = getTagColor(tag);
                return (
                  <span
                    key={idx}
                    className={cn(
                      'px-2 py-0.5 text-xs font-medium text-white rounded',
                      color
                    )}
                  >
                    {tag}
                  </span>
                );
              })}
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

