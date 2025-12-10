import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import api from '../lib/api';
import { Job } from '../types';
import { useBoardStore } from '../store/useBoardStore';

export const useJobs = () => {
  const queryClient = useQueryClient();
  const { setJobs } = useBoardStore();

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const response = await api.get('/jobs');
        const jobsData = response?.data?.jobs ?? [];
        // Normalize jobs: extract columnId from populated object if needed
        const normalizedJobs = Array.isArray(jobsData) ? jobsData.map((job: any) => ({
          ...job,
          columnId: typeof job?.columnId === 'object' && job?.columnId?._id 
            ? job.columnId._id 
            : job?.columnId,
        })) : [];
        return normalizedJobs;
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message ?? error?.message ?? 'Failed to fetch jobs';
        toast.error('Error loading jobs', {
          description: errorMessage,
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes (allows React Query to deduplicate)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists (React Query will deduplicate)
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  useEffect(() => {
    if (jobs.length > 0 || !isLoading) {
      setJobs(jobs);
    }
  }, [jobs, setJobs, isLoading]);

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Job>) => {
      const response = await api.post('/jobs', data);
      // Normalize the response
      const job = response?.data?.job;
      if (!job) {
        throw new Error('Invalid response from server');
      }
      return {
        ...job,
        columnId: typeof job?.columnId === 'object' && job?.columnId?._id 
          ? job.columnId._id 
          : job?.columnId,
      };
    },
    onSuccess: (newJob) => {
      // Optimistically update cache instead of refetching
      queryClient.setQueryData<Job[]>(['jobs'], (old = []) => [...old, newJob]);
      toast.success('Job added successfully!', {
        description: `${newJob.companyName} - ${newJob.role}`,
      });
    },
    onError: () => {
      toast.error('Failed to add job', {
        description: 'Please try again.',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Job>) => {
      if (!id) {
        throw new Error('Job ID is required');
      }
      const response = await api.put(`/jobs/${id}`, data);
      // Normalize the response
      const job = response?.data?.job;
      if (!job) {
        throw new Error('Invalid response from server');
      }
      return {
        ...job,
        columnId: typeof job?.columnId === 'object' && job?.columnId?._id 
          ? job.columnId._id 
          : job?.columnId,
      };
    },
    onSuccess: (updatedJob) => {
      // Optimistically update cache instead of refetching
      queryClient.setQueryData<Job[]>(['jobs'], (old = []) =>
        old.map((job) => (job._id === updatedJob._id ? updatedJob : job))
      );
      toast.success('Job updated successfully!', {
        description: `${updatedJob.companyName} - ${updatedJob.role}`,
      });
    },
    onError: () => {
      toast.error('Failed to update job', {
        description: 'Please try again.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error('Job ID is required');
      }
      await api.delete(`/jobs/${id}`);
    },
    onSuccess: (_, deletedId) => {
      // Optimistically update cache instead of refetching
      queryClient.setQueryData<Job[]>(['jobs'], (old = []) =>
        old.filter((job) => job._id !== deletedId)
      );
      // Invalidate interviews since deleting a job affects interviews
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Job deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete job', {
        description: 'Please try again.',
      });
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

