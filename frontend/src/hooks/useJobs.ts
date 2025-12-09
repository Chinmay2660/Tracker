import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '../lib/api';
import { Job } from '../types';
import { useBoardStore } from '../store/useBoardStore';

export const useJobs = () => {
  const queryClient = useQueryClient();
  const { setJobs } = useBoardStore();

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await api.get('/jobs');
      // Normalize jobs: extract columnId from populated object if needed
      const normalizedJobs = response.data.jobs.map((job: any) => ({
        ...job,
        columnId: typeof job.columnId === 'object' && job.columnId?._id 
          ? job.columnId._id 
          : job.columnId,
      }));
      return normalizedJobs;
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds (allows React Query to deduplicate)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists (React Query will deduplicate)
  });

  useEffect(() => {
    if (jobs.length > 0 || !isLoading) {
      setJobs(jobs);
    }
  }, [jobs, setJobs, isLoading]);

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Job>) => {
      const response = await api.post('/jobs', data);
      return response.data.job;
    },
    onSuccess: () => {
      // Invalidate and refetch jobs immediately
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.refetchQueries({ queryKey: ['jobs'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Job>) => {
      const response = await api.put(`/jobs/${id}`, data);
      return response.data.job;
    },
    onSuccess: () => {
      // Invalidate and refetch jobs immediately
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.refetchQueries({ queryKey: ['jobs'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, columnId }: { id: string; columnId: string }) => {
      const response = await api.patch(`/jobs/${id}/move`, { columnId });
      return response.data.job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  return {
    jobs,
    isLoading,
    createJob: createMutation.mutate,
    updateJob: updateMutation.mutate,
    deleteJob: deleteMutation.mutate,
    moveJob: moveMutation.mutate,
  };
};

