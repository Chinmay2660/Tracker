import { useQueries } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../lib/api';
import { Column, Job, ResumeVersion } from '../types';

/**
 * Prefetches all dashboard data in parallel:
 * - Columns
 * - Jobs
 * - Resumes
 * 
 * This is more efficient than calling each hook separately
 * as it ensures all requests fire simultaneously.
 */
export const useDashboardData = () => {
  const results = useQueries({
    queries: [
      {
        queryKey: ['columns'],
        queryFn: async (): Promise<Column[]> => {
          try {
            const response = await api.get('/columns');
            return response?.data?.columns ?? [];
          } catch (error: any) {
            const errorMessage = error?.response?.data?.message ?? error?.message ?? 'Failed to fetch columns';
            toast.error('Error loading columns', { description: errorMessage });
            return [];
          }
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      {
        queryKey: ['jobs'],
        queryFn: async (): Promise<Job[]> => {
          try {
            const response = await api.get('/jobs');
            const jobsData = response?.data?.jobs ?? [];
            // Normalize jobs: extract columnId from populated object if needed
            return Array.isArray(jobsData) ? jobsData.map((job: any) => ({
              ...job,
              columnId: typeof job?.columnId === 'object' && job?.columnId?._id 
                ? job.columnId._id 
                : job?.columnId,
            })) : [];
          } catch (error: any) {
            const errorMessage = error?.response?.data?.message ?? error?.message ?? 'Failed to fetch jobs';
            toast.error('Error loading jobs', { description: errorMessage });
            throw error;
          }
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      {
        queryKey: ['resumes'],
        queryFn: async (): Promise<ResumeVersion[]> => {
          try {
            const response = await api.get('/resumes');
            return response?.data?.resumes ?? [];
          } catch (error: any) {
            const errorMessage = error?.response?.data?.message ?? error?.message ?? 'Failed to fetch resumes';
            toast.error('Error loading resumes', { description: errorMessage });
            return [];
          }
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    ],
  });

  const [columnsResult, jobsResult, resumesResult] = results;

  return {
    columns: columnsResult.data ?? [],
    jobs: jobsResult.data ?? [],
    resumes: resumesResult.data ?? [],
    isLoading: columnsResult.isLoading || jobsResult.isLoading || resumesResult.isLoading,
    isColumnsLoading: columnsResult.isLoading,
    isJobsLoading: jobsResult.isLoading,
    isResumesLoading: resumesResult.isLoading,
    error: columnsResult.error || jobsResult.error || resumesResult.error,
  };
};

