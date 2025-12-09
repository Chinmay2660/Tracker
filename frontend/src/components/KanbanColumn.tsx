import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreVertical } from 'lucide-react';
import { Job } from '../types';
import JobCard from './JobCard';
import { Button } from './ui/button';
import { useState, memo } from 'react';
import JobForm from './JobForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface KanbanColumnProps {
  column: {
    _id: string;
    title: string;
    order: number;
  };
  jobs: Job[];
}

function KanbanColumn({ column, jobs }: KanbanColumnProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column-${column._id}`,
    disabled: true, // Disable column dragging for now
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex-shrink-0 w-80 bg-muted/50 rounded-lg p-4 flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">{column.title}</h3>
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground">{jobs.length}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto min-h-[200px]">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </div>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent onClose={() => setIsFormOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add New Job</DialogTitle>
          </DialogHeader>
          <JobForm
            defaultColumnId={column._id}
            onSuccess={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(KanbanColumn);

