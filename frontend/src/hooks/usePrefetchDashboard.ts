import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '../lib/api';
import { Column, Job, ResumeVersion } from '../types';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Prefetches dashboard data when user is authenticated.
 * This runs in the background and populates the cache
 * so data is ready when user navigates to dashboard.
 */
export const usePrefetchDashboard = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    // Prefetch all dashboard data in parallel
    const prefetch = async () => {
      await Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: ['columns'],
          queryFn: async (): Promise<Column[]> => {
            const response = await api.get('/columns');
            return response?.data?.columns ?? [];
          },
          staleTime: 5 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: ['jobs'],
          queryFn: async (): Promise<Job[]> => {
            const response = await api.get('/jobs');
            const jobsData = response?.data?.jobs ?? [];
            return Array.isArray(jobsData) ? jobsData.map((job: any) => ({
              ...job,
              columnId: typeof job?.columnId === 'object' && job?.columnId?._id 
                ? job.columnId._id 
                : job?.columnId,
            })) : [];
          },
          staleTime: 5 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: ['resumes'],
          queryFn: async (): Promise<ResumeVersion[]> => {
            const response = await api.get('/resumes');
            return response?.data?.resumes ?? [];
          },
          staleTime: 5 * 60 * 1000,
        }),
      ]);
    };

    prefetch();
  }, [token, queryClient]);
};

