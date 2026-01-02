import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Trash2, Edit2, GripVertical } from 'lucide-react';
import { Job } from '../types';
import JobCard from './JobCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { memo, useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useColumns } from '../hooks/useColumns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Skeleton } from './ui/skeleton';

// Lazy load dialogs - only loaded when user opens them
const Dialog = lazy(() => import('./ui/dialog').then(m => ({ default: m.Dialog })));
const DialogContent = lazy(() => import('./ui/dialog').then(m => ({ default: m.DialogContent })));
const DialogHeader = lazy(() => import('./ui/dialog').then(m => ({ default: m.DialogHeader })));
const DialogTitle = lazy(() => import('./ui/dialog').then(m => ({ default: m.DialogTitle })));
const DialogDescription = lazy(() => import('./ui/dialog').then(m => ({ default: m.DialogDescription })));

interface KanbanColumnProps {
  column: {
    _id: string;
    title: string;
    order: number;
    color?: string;
  };
  jobs: Job[];
}

const PRESET_COLORS = [
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#ef4444', // red
  '#6366f1', // indigo
  '#64748b', // slate
];

const columnEditSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  color: z.string().optional(),
});

type ColumnEditData = z.infer<typeof columnEditSchema>;

function KanbanColumn({ column, jobs }: KanbanColumnProps) {
  const { deleteColumn, updateColumn } = useColumns();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(column.color || '#14b8a6');
  const menuRef = useRef<HTMLDivElement>(null);
  
  const {
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
    attributes,
    listeners,
  } = useSortable({ id: `column-${column._id}` });

  // Make the column a drop target for jobs
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `column-${column._id}`,
  });

  // Combine refs
  const setNodeRef = (node: HTMLElement | null) => {
    setSortableRef(node);
    setDroppableRef(node);
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ColumnEditData>({
    resolver: zodResolver(columnEditSchema),
    defaultValues: { title: column.title },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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
    setSelectedColor(column.color || '#14b8a6');
    reset({ title: column.title, color: column.color || '#14b8a6' });
  };

  const onSubmitEdit = (data: ColumnEditData) => {
    updateColumn({ id: column._id, title: data.title, color: selectedColor });
    setIsEditOpen(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-slate-100 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4 flex flex-col w-[300px] shrink-0 transition-colors ${isOver ? 'ring-2 ring-teal-500 bg-teal-50 dark:bg-teal-900/20' : ''}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors touch-none"
            >
              <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: column.color || '#14b8a6' }}
            />
            <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">{column.title}</h3>
            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
              {jobs.length}
            </span>
          </div>
          
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 z-50 w-40 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Jobs list */}
        <div className="flex-1 space-y-2 sm:space-y-3 overflow-y-auto min-h-[150px] max-h-[calc(100vh-280px)] scrollbar-hide">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
          {jobs.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">
              No jobs yet
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog - Lazy loaded */}
      {isEditOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><Skeleton className="w-80 h-48 rounded-xl" /></div>}>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent onClose={() => setIsEditOpen(false)}>
              <DialogHeader>
                <DialogTitle>Edit Stage</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Stage Title</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    className={errors.title ? 'border-red-500' : ''}
                    placeholder="e.g., Technical Interview"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <Label>Stage Color</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white' : 'hover:scale-110'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Label htmlFor="customColor" className="text-sm text-muted-foreground">Custom:</Label>
                    <Input
                      id="customColor"
                      type="text"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      placeholder="#14b8a6"
                      className="w-28 h-9 font-mono text-sm"
                    />
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer border-0"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </Suspense>
      )}

      {/* Delete Dialog - Lazy loaded */}
      {isDeleteDialogOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><Skeleton className="w-80 h-40 rounded-xl" /></div>}>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent onClose={() => setIsDeleteDialogOpen(false)}>
              <DialogHeader>
                <DialogTitle>Delete Stage</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{column.title}"? This will also delete all jobs in this stage.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Suspense>
      )}
    </>
  );
}

export default memo(KanbanColumn);
