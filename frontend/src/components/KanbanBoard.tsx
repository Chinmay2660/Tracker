import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useState, memo, useMemo, useCallback } from 'react';
import { useColumns } from '../hooks/useColumns';
import { useJobs } from '../hooks/useJobs';
import { useResumes } from '../hooks/useResumes';
import KanbanColumn from './KanbanColumn';
import JobCard from './JobCard';
import { Job, Column } from '../types';

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
      <SortableContext
        items={sortedColumns.map((c: Column) => `column-${c._id}`)}
        strategy={rectSortingStrategy}
      >
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
      </SortableContext>
      <DragOverlay>
        {activeJob ? (
          <div className="opacity-90">
            <JobCard job={activeJob} isDragging />
          </div>
        ) : activeColumn ? (
          <div className="opacity-90 flex-shrink-0 w-80 bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold text-lg">{activeColumn.title}</h3>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default memo(KanbanBoard);

