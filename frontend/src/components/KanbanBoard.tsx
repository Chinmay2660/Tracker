import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  CollisionDetection,
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
  const { jobs = [], moveJob, reorderJobs, isLoading: jobsLoading } = useJobs();
  // Load resumes when board loads (alongside columns and jobs)
  useResumes();
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Custom collision detection that works better for grid layouts
  const collisionDetection: CollisionDetection = (args) => {
    // First, try pointer within (most accurate for the pointer position)
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    // Fallback to rect intersection for edge cases
    return rectIntersection(args);
  };

  const sortedColumns = useMemo(() => {
    return [...columns].sort((a: Column, b: Column) => a.order - b.order);
  }, [columns]);

  const columnJobsMap = useMemo(() => {
    const map = new Map<string, Job[]>();
    if (!Array.isArray(sortedColumns) || !Array.isArray(jobs)) return map;
    sortedColumns.forEach((column) => {
      if (!column?._id) return;
      const columnJobs = jobs
        .filter((job: Job) => job?.columnId === column._id)
        .sort((a: Job, b: Job) => {
          // Sort by order first, then by updatedAt as fallback
          const orderA = a?.order ?? 0;
          const orderB = b?.order ?? 0;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          const dateA = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });
      map.set(column._id, columnJobs);
    });
    return map;
  }, [sortedColumns, jobs]);

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

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Only handle job-to-job reordering during drag over
    if (!activeId.startsWith('column-') && !overId.startsWith('column-')) {
      const activeJobObj = jobs.find((j: Job) => j._id === activeId);
      const overJobObj = jobs.find((j: Job) => j._id === overId);
      
      if (activeJobObj && overJobObj && activeJobObj.columnId === overJobObj.columnId) {
        // Same column - let @dnd-kit handle the visual reordering
        // The actual reorder will be saved in handleDragEnd
      }
    }
  }, [jobs]);

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

    // Handle job drag (not column drag)
    if (!activeId.startsWith('column-')) {
      const activeJobObj = jobs.find((j: Job) => j._id === activeId);
      if (!activeJobObj) return;

      // Dropping on another job
      if (!overId.startsWith('column-')) {
        const overJobObj = jobs.find((j: Job) => j._id === overId);
        if (!overJobObj) return;

        if (activeJobObj.columnId === overJobObj.columnId) {
          // Same column - reorder jobs
          const columnId = activeJobObj.columnId;
          const columnJobs = columnJobsMap.get(columnId) || [];
          const oldIndex = columnJobs.findIndex((j: Job) => j._id === activeId);
          const newIndex = columnJobs.findIndex((j: Job) => j._id === overId);
          
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const reorderedJobsList = arrayMove(columnJobs, oldIndex, newIndex);
            const jobIds = reorderedJobsList.map((j: Job) => j._id);
            reorderJobs(jobIds);
          }
        } else {
          // Different column - move job to the column of the target job
          moveJob({ id: activeId, columnId: overJobObj.columnId });
        }
        return;
      }

      // Dropping on a column container
      if (overId.startsWith('column-')) {
        const targetColumnId = overId.replace('column-', '');
        
        if (activeJobObj.columnId !== targetColumnId) {
          // Different column - move job
          moveJob({ id: activeId, columnId: targetColumnId });
        }
      }
    }
  }, [jobs, moveJob, reorderJobs, sortedColumns, updateColumn, columnJobsMap]);

  if (columnsLoading || jobsLoading) {
    return (
      <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
        <div className="flex gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-w-max sm:min-w-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-4 w-[280px] sm:w-auto shrink-0 sm:shrink">
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
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart} 
      onDragOver={handleDragOver} 
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedColumns.map((c: Column) => `column-${c._id}`)}
        strategy={verticalListSortingStrategy}
      >
        {/* Mobile: Horizontal scroll, Desktop: Grid layout */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
          <div className="flex gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-w-max sm:min-w-0">
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
        </div>
      </SortableContext>
      <DragOverlay
        style={{
          cursor: 'grabbing',
        }}
        dropAnimation={{
          duration: 150,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1)',
        }}
      >
        {activeJob ? (
          <div 
            className="opacity-95 shadow-2xl"
            style={{
              transform: 'scale(1.05)',
              willChange: 'transform',
              pointerEvents: 'none',
            }}
          >
            <JobCard job={activeJob} isDragging />
          </div>
        ) : activeColumn ? (
          <div 
            className="opacity-95 bg-muted/50 rounded-lg p-4 shadow-2xl"
            style={{
              transform: 'scale(1.05)',
              willChange: 'transform',
              pointerEvents: 'none',
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

