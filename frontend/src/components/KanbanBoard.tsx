import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState, memo, useMemo, useCallback } from 'react';
import { useColumns } from '../hooks/useColumns';
import { useJobs } from '../hooks/useJobs';
import KanbanColumn from './KanbanColumn';
import JobCard from './JobCard';
import { Job, Column } from '../types';

function KanbanBoard() {
  const { columns = [], isLoading: columnsLoading } = useColumns();
  const { jobs = [], moveJob, isLoading: jobsLoading } = useJobs();
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const job = jobs.find((j: Job) => j._id === active.id);
    setActiveJob(job || null);
  }, [jobs]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) return;

    const jobId = active.id as string;
    const columnId = over.id as string;

    if (columnId.startsWith('column-')) {
      const targetColumnId = columnId.replace('column-', '');
      const currentJob = jobs.find((j: Job) => j._id === jobId);
      if (currentJob && currentJob.columnId !== targetColumnId) {
        moveJob({ id: jobId, columnId: targetColumnId });
      }
    }
  }, [jobs, moveJob]);

  const sortedColumns = useMemo(() => {
    return [...columns].sort((a: Column, b: Column) => a.order - b.order);
  }, [columns]);

  const columnJobsMap = useMemo(() => {
    const map = new Map<string, Job[]>();
    sortedColumns.forEach((column) => {
      const columnJobs = jobs
        .filter((job: Job) => job.columnId === column._id)
        .sort((a: Job, b: Job) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      map.set(column._id, columnJobs);
    });
    return map;
  }, [sortedColumns, jobs]);

  if (columnsLoading || jobsLoading) {
    return <div className="text-center py-8">Loading board...</div>;
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
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
      <DragOverlay>
        {activeJob ? (
          <div className="opacity-90">
            <JobCard job={activeJob} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default memo(KanbanBoard);

