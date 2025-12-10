import { useEffect } from 'react';
import { useColumns } from '../hooks/useColumns';
import KanbanBoard from '../components/KanbanBoard';
import JobStageCharts from '../components/JobStageCharts';
import { Button } from '../components/ui/button';
import { Plus, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import JobForm from '../components/JobForm';

const columnSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

type ColumnFormData = z.infer<typeof columnSchema>;

export default function DashboardPage() {
  const { columns = [], createColumn, isLoading } = useColumns();
  const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ColumnFormData>({
    resolver: zodResolver(columnSchema),
  });

  useEffect(() => {
    if (!isLoading && columns.length === 0 && !hasInitialized) {
      setHasInitialized(true);
      const defaultColumns = ['Applied', 'Recruiter Call', 'OA', 'Phone Screen', 'Onsite', 'Offer'];
      defaultColumns.forEach((title, index) => {
        createColumn({ title, order: index });
      });
    }
  }, [columns.length, createColumn, isLoading, hasInitialized]);

  const onSubmit = (data: ColumnFormData) => {
    const maxOrder = Math.max(...columns.map((c: { order: number }) => c.order), -1);
    createColumn({ title: data.title, order: maxOrder + 1 });
    reset();
    setIsColumnFormOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Job Board</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track your applications across stages</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsJobFormOpen(true)} 
            className="flex-1 sm:flex-none bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Add Job
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsColumnFormOpen(true)}
            className="flex-1 sm:flex-none border-slate-300 dark:border-slate-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Stage
          </Button>
        </div>
      </div>

      {/* Charts */}
      <JobStageCharts />

      {/* Kanban Board */}
      <KanbanBoard />

      {/* Add Stage Dialog */}
      <Dialog open={isColumnFormOpen} onOpenChange={setIsColumnFormOpen}>
        <DialogContent onClose={() => setIsColumnFormOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add New Stage</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsColumnFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Stage</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Job Dialog */}
      <Dialog open={isJobFormOpen} onOpenChange={setIsJobFormOpen}>
        <DialogContent onClose={() => setIsJobFormOpen(false)} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Job</DialogTitle>
          </DialogHeader>
          <JobForm onSuccess={() => setIsJobFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
