import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Trash2, Edit2, GripVertical } from 'lucide-react';
import { Job } from '../types';
import JobCard from './JobCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { memo, useState, useRef, useEffect } from 'react';
import { useColumns } from '../hooks/useColumns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface KanbanColumnProps {
  column: {
    _id: string;
    title: string;
    order: number;
  };
  jobs: Job[];
}

const columnEditSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

type ColumnEditData = z.infer<typeof columnEditSchema>;

function KanbanColumn({ column, jobs }: KanbanColumnProps) {
  const { deleteColumn, updateColumn } = useColumns();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    attributes,
    listeners,
  } = useSortable({
    id: `column-${column._id}`,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ColumnEditData>({
    resolver: zodResolver(columnEditSchema),
    defaultValues: {
      title: column.title,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition, // Disable transition while dragging for smoother animation
    opacity: isDragging ? 0.4 : 1,
    willChange: isDragging ? 'transform' : 'auto', // Optimize for transforms
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
    setShowMenu(false);
  };

  const handleDeleteConfirm = () => {
    deleteColumn(column._id);
    setIsDeleteDialogOpen(false);
  };

  const handleEdit = () => {
    setIsEditOpen(true);
    setShowMenu(false);
    reset({ title: column.title });
  };

  const onSubmitEdit = (data: ColumnEditData) => {
    updateColumn({ id: column._id, title: data.title });
    setIsEditOpen(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-muted/50 rounded-lg p-4 flex flex-col ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            >
              <GripVertical className="h-5 w-5" />
            </button>
            <h3 className="font-semibold text-lg truncate">{column.title}</h3>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">{jobs.length}</span>
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {showMenu && (
                <div className="absolute right-0 top-8 z-50 w-48 bg-popover border border-border rounded-md shadow-lg">
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Column
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-accent hover:text-destructive transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Column
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto min-h-[200px]">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      </div>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent onClose={() => setIsEditOpen(false)}>
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
            <div>
              <Label htmlFor="title">Column Title</Label>
              <Input
                id="title"
                {...register('title')}
                className={errors.title ? 'border-destructive' : ''}
                placeholder="e.g., Technical Interview"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent onClose={() => setIsDeleteDialogOpen(false)}>
              <DialogHeader>
                <DialogTitle>Delete Column</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{column.title}"? This will also delete all jobs in this column. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
    </>
  );
}

export default memo(KanbanColumn);

