import { create } from 'zustand';
import { Column, Job } from '../types';

interface BoardState {
  columns: Column[];
  jobs: Job[];
  setColumns: (columns: Column[]) => void;
  setJobs: (jobs: Job[]) => void;
  addColumn: (column: Column) => void;
  updateColumn: (id: string, updates: Partial<Column>) => void;
  deleteColumn: (id: string) => void;
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  moveJob: (jobId: string, columnId: string) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  columns: [],
  jobs: [],
  setColumns: (columns) => set({ columns }),
  setJobs: (jobs) => set({ jobs }),
  addColumn: (column) => set((state) => ({ columns: [...state.columns, column] })),
  updateColumn: (id, updates) =>
    set((state) => ({
      columns: state.columns.map((col) => (col._id === id ? { ...col, ...updates } : col)),
    })),
  deleteColumn: (id) =>
    set((state) => ({
      columns: state.columns.filter((col) => col._id !== id),
    })),
  addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((job) => (job._id === id ? { ...job, ...updates } : job)),
    })),
  deleteJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((job) => job._id !== id),
    })),
  moveJob: (jobId, columnId) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job._id === jobId ? { ...job, columnId } : job
      ),
    })),
}));

