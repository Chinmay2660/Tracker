import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useState, memo, useMemo, useCallback } from 'react';
import { useColumns } from '../hooks/useColumns';
import { useJobs } from '../hooks/useJobs';
import { useResumes } from '../hooks/useResumes';
import KanbanColumn from './KanbanColumn';
import JobCard from './JobCard';
import { Job, Column } from '../types';
import { Skeleton } from './ui/skeleton';

function KanbanBoard() {
  const { columns = [], isLoading: columnsLoading, updateColumn } = useColumns();
  const { jobs = [], moveJob, isLoading: jobsLoading } = useJobs();
  // Load resumes when board loads (alongside columns and jobs)
  useResumes();
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const sortedColumns = useMemo(() => {
    return [...columns].sort((a: Column, b: Column) => a.order - b.order);
  }, [columns]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    
    // Check if it's a job
    const job = jobs.find((j: Job) => j._id === activeId);
    if (job) {
      setActiveJob(job);
      return;
    }
    
    // Check if it's a column
    if (activeId.startsWith('column-')) {
      const columnId = activeId.replace('column-', '');
      const column = columns.find((c: Column) => c._id === columnId);
      if (column) {
        setActiveColumn(column);
      }
    }
  }, [jobs, columns]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);
    setActiveColumn(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle column reordering
    if (activeId.startsWith('column-') && overId.startsWith('column-')) {
      const activeColumnId = activeId.replace('column-', '');
      const overColumnId = overId.replace('column-', '');
      
      if (activeColumnId !== overColumnId) {
        const oldIndex = sortedColumns.findIndex((c: Column) => c._id === activeColumnId);
        const newIndex = sortedColumns.findIndex((c: Column) => c._id === overColumnId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedColumns = arrayMove(sortedColumns, oldIndex, newIndex);
          
          // Update order for all affected columns
          reorderedColumns.forEach((column: Column, index: number) => {
            if (column.order !== index) {
              updateColumn({ id: column._id, order: index });
            }
          });
        }
      }
      return;
    }

    // Handle job moving between columns
    if (!activeId.startsWith('column-') && overId.startsWith('column-')) {
      const jobId = activeId;
      const targetColumnId = overId.replace('column-', '');
      const currentJob = jobs.find((j: Job) => j._id === jobId);
      if (currentJob && currentJob.columnId !== targetColumnId) {
        moveJob({ id: jobId, columnId: targetColumnId });
      }
    }
  }, [jobs, moveJob, sortedColumns, updateColumn]);

  const columnJobsMap = useMemo(() => {
    const map = new Map<string, Job[]>();
    if (!Array.isArray(sortedColumns) || !Array.isArray(jobs)) return map;
    sortedColumns.forEach((column) => {
      if (!column?._id) return;
      const columnJobs = jobs
        .filter((job: Job) => job?.columnId === column._id)
        .sort((a: Job, b: Job) => {
          const dateA = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });
      map.set(column._id, columnJobs);
    });
    return map;
  }, [sortedColumns, jobs]);

  if (columnsLoading || jobsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-8" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="p-4 bg-background rounded-lg border border-border">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext
        items={sortedColumns.map((c: Column) => `column-${c._id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedColumns.map((column) => {
            const columnJobs = columnJobsMap.get(column._id) || [];

            return (
              <SortableContext
                key={column._id}
                id={`column-${column._id}`}
                items={columnJobs.map((j) => j._id)}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn column={column} jobs={columnJobs} />
              </SortableContext>
            );
          })}
        </div>
      </SortableContext>
      <DragOverlay
        style={{
          cursor: 'grabbing',
        }}
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1)',
        }}
      >
        {activeJob ? (
          <div 
            className="opacity-90 rotate-2 shadow-2xl"
            style={{
              transform: 'rotate(2deg) scale(1.02)',
              willChange: 'transform',
            }}
          >
            <JobCard job={activeJob} isDragging />
          </div>
        ) : activeColumn ? (
          <div 
            className="opacity-90 bg-muted/50 rounded-lg p-4 shadow-2xl"
            style={{
              transform: 'scale(1.02)',
              willChange: 'transform',
            }}
          >
            <h3 className="font-semibold text-lg">{activeColumn.title}</h3>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default memo(KanbanBoard);

