import { useEffect } from 'react';
import { useColumns } from '../hooks/useColumns';
import KanbanBoard from '../components/KanbanBoard';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const columnSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

type ColumnFormData = z.infer<typeof columnSchema>;

export default function DashboardPage() {
  const { columns = [], createColumn, isLoading } = useColumns();
  const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ColumnFormData>({
    resolver: zodResolver(columnSchema),
  });

  useEffect(() => {
    // Only create default columns once, when columns are loaded and empty
    if (!isLoading && columns.length === 0 && !hasInitialized) {
      const defaultColumns = [
        'Applied',
        'Recruiter Call',
        'OA',
        'Phone Screen',
        'Onsite',
        'Offer',
      ];
      defaultColumns.forEach((title, index) => {
        createColumn({ title, order: index });
      });
      setHasInitialized(true);
    }
  }, [columns.length, createColumn, isLoading, hasInitialized]);

  const onSubmit = (data: ColumnFormData) => {
    const maxOrder = Math.max(...columns.map((c: { order: number }) => c.order), -1);
    createColumn({ title: data.title, order: maxOrder + 1 });
    reset();
    setIsColumnFormOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Board</h1>
        <Button onClick={() => setIsColumnFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </div>
      <KanbanBoard />
      <Dialog open={isColumnFormOpen} onOpenChange={setIsColumnFormOpen}>
        <DialogContent onClose={() => setIsColumnFormOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                onClick={() => setIsColumnFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Column</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

