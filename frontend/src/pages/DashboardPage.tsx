import { useEffect, useState, memo, useMemo } from 'react';
import { useColumns } from '../hooks/useColumns';
import { useJobs } from '../hooks/useJobs';
import { useAllInterviews } from '../hooks/useAllInterviews';
import KanbanBoard from '../components/KanbanBoard';
import KanbanFilters from '../components/KanbanFilters';
import JobStageChartsLazy from '../components/JobStageChartsLazy';
import FollowUpWidget from '../components/FollowUpWidget';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Plus, Briefcase } from 'lucide-react';
import AddStageDialog from '../components/AddStageDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import JobForm from '../components/JobForm';
import { DEFAULT_KANBAN_FILTERS, filterJobs, getUniqueJobTags } from '../lib/jobFilters';

function DashboardPage() {
    const { columns = [], createColumn, isLoading } = useColumns();
    const { jobs = [] } = useJobs();
    const { data: interviews = [] } = useAllInterviews();
    const [filters, setFilters] = useState(DEFAULT_KANBAN_FILTERS);
    const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);
    const [isJobFormOpen, setIsJobFormOpen] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    useEffect(() => {
        if (!isLoading && columns.length === 0 && !hasInitialized) {
            setHasInitialized(true);
            const defaultColumns = [
                { title: 'Applied', color: '#14b8a6' },
                { title: 'Recruiter Call', color: '#3b82f6' },
                { title: 'OA', color: '#8b5cf6' },
                { title: 'Phone Screen', color: '#ec4899' },
                { title: 'Onsite', color: '#f97316' },
                { title: 'Offer', color: '#22c55e' },
            ];
            defaultColumns.forEach(({ title, color }, index) => {
                createColumn({ title, order: index, color, silent: true });
            });
        }
    }, [columns.length, createColumn, isLoading, hasInitialized]);

    const offerColumnIds = useMemo(
        () => columns.filter((c) => c.title.toLowerCase() === 'offer').map((c) => c._id),
        [columns],
    );
    const filteredJobs = useMemo(
        () => filterJobs(jobs, filters, interviews, offerColumnIds),
        [jobs, filters, interviews, offerColumnIds],
    );
    const uniqueTags = useMemo(() => getUniqueJobTags(jobs), [jobs]);

    return (
        <div className="space-y-4 sm:space-y-6">
            <PageHeader
                title="Job Board"
                description="Track your applications across stages"
                actions={(
                    <>
                        <Button onClick={() => setIsJobFormOpen(true)} className="flex-1 sm:flex-none bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white">
                            <Briefcase className="w-4 h-4 mr-2" />
                            Add Job
                        </Button>
                        <Button variant="outline" onClick={() => setIsColumnFormOpen(true)} className="flex-1 sm:flex-none border-slate-300 dark:border-slate-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Stage
                        </Button>
                    </>
                )}
            />

            <FollowUpWidget jobs={jobs} />
            <JobStageChartsLazy />
            <KanbanFilters filters={filters} onChange={setFilters} columns={columns} tags={uniqueTags} />
            <KanbanBoard filteredJobs={filteredJobs} />
            <AddStageDialog open={isColumnFormOpen} onOpenChange={setIsColumnFormOpen} />

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
export default memo(DashboardPage);
