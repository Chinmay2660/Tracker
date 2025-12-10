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
      if (!id || !columnId) {
        throw new Error('Job ID and Column ID are required');
      }
      const response = await api.patch(`/jobs/${id}/move`, { columnId });
      const job = response?.data?.job;
      if (!job) {
        throw new Error('Invalid response from server');
      }
      // Normalize the response
      return {
        ...job,
        columnId: typeof job?.columnId === 'object' && job?.columnId?._id 
          ? job.columnId._id 
          : job?.columnId,
      };
    },
    onMutate: async ({ id, columnId }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['jobs'] });

      // Snapshot the previous value
      const previousJobs = queryClient.getQueryData<Job[]>(['jobs']);

      // Optimistically update to the new value
      queryClient.setQueryData<Job[]>(['jobs'], (old = []) =>
        old.map((job) =>
          job._id === id ? { ...job, columnId } : job
        )
      );

      // Return a context object with the snapshotted value
      return { previousJobs };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousJobs) {
        queryClient.setQueryData<Job[]>(['jobs'], context.previousJobs);
      }
      toast.error('Failed to move job', {
        description: 'Please try again.',
      });
    },
    onSuccess: (updatedJob) => {
      // Update with the actual response to ensure consistency
      queryClient.setQueryData<Job[]>(['jobs'], (old = []) =>
        old.map((job) => (job._id === updatedJob._id ? updatedJob : job))
      );
    },
    onSettled: () => {
      // Optionally refetch to ensure we're in sync with the server
      // But do it in the background without blocking
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (jobIds: string[]) => {
      if (!Array.isArray(jobIds) || jobIds.length === 0) {
        throw new Error('Job IDs array is required');
      }
      await api.patch('/jobs/reorder', { jobIds });
    },
    onMutate: async (jobIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['jobs'] });

      // Snapshot the previous value
      const previousJobs = queryClient.getQueryData<Job[]>(['jobs']);

      // Optimistically update order
      queryClient.setQueryData<Job[]>(['jobs'], (old = []) => {
        const jobMap = new Map(old.map(job => [job._id, job]));
        return jobIds.map((id, index) => {
          const job = jobMap.get(id);
          return job ? { ...job, order: index } : job;
        }).filter(Boolean) as Job[];
      });

      return { previousJobs };
    },
    onError: (err, variables, context) => {
      // Roll back on error
      if (context?.previousJobs) {
        queryClient.setQueryData<Job[]>(['jobs'], context.previousJobs);
      }
      toast.error('Failed to reorder jobs', {
        description: 'Please try again.',
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
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
    reorderJobs: reorderMutation.mutate,
  };
};

