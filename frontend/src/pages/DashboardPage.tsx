import { useEffect, useState, memo, lazy, Suspense } from 'react';
import { useColumns } from '../hooks/useColumns';
import KanbanBoard from '../components/KanbanBoard';
import JobStageChartsLazy from '../components/JobStageChartsLazy';
import { Button } from '../components/ui/button';
import { Plus, Briefcase } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import AddStageDialog from '../components/AddStageDialog';

// Lazy load heavy dialog components
const Dialog = lazy(() => import('../components/ui/dialog').then(m => ({ default: m.Dialog })));
const DialogContent = lazy(() => import('../components/ui/dialog').then(m => ({ default: m.DialogContent })));
const DialogHeader = lazy(() => import('../components/ui/dialog').then(m => ({ default: m.DialogHeader })));
const DialogTitle = lazy(() => import('../components/ui/dialog').then(m => ({ default: m.DialogTitle })));
const JobForm = lazy(() => import('../components/JobForm'));

// Lightweight dialog fallback
const DialogFallback = () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center"><Skeleton className="w-96 h-64 rounded-xl" /></div>;

function DashboardPage() {
  const { columns = [], createColumn, isLoading } = useColumns();
  const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading && columns.length === 0 && !hasInitialized) {
      setHasInitialized(true);
      const defaultColumns = ['Applied', 'Recruiter Call', 'OA', 'Phone Screen', 'Onsite', 'Offer'];
      defaultColumns.forEach((title, index) => {
        createColumn({ title, order: index, silent: true });
      });
    }
  }, [columns.length, createColumn, isLoading, hasInitialized]);

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

      {/* Charts - Lazy loaded for faster FCP */}
      <JobStageChartsLazy />

      {/* Kanban Board */}
      <KanbanBoard />

      {/* Add Stage Dialog */}
      <AddStageDialog open={isColumnFormOpen} onOpenChange={setIsColumnFormOpen} />

      {/* Add Job Dialog - Lazy loaded */}
      {isJobFormOpen && (
        <Suspense fallback={<DialogFallback />}>
          <Dialog open={isJobFormOpen} onOpenChange={setIsJobFormOpen}>
            <DialogContent onClose={() => setIsJobFormOpen(false)} className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Job</DialogTitle>
              </DialogHeader>
              <JobForm onSuccess={() => setIsJobFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </Suspense>
      )}
    </div>
  );
}

export default memo(DashboardPage);
