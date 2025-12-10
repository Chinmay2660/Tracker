import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../lib/api';
import { InterviewRound } from '../types';

export const useJobInterviews = (jobId: string) => {
  return useQuery<InterviewRound[]>({
    queryKey: ['interviews', jobId],
    queryFn: async () => {
      if (!jobId) {
        return [];
      }
      try {
        const response = await api.get(`/interviews/jobs/${jobId}`);
        return response?.data?.interviews ?? [];
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message ?? error?.message ?? 'Failed to fetch interviews';
        toast.error('Error loading interviews', {
          description: errorMessage,
        });
        return [];
      }
    },
    enabled: !!jobId,
  });
};

export const useInterviews = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InterviewRound>) => {
      if (!data?.jobId) {
        throw new Error('Job ID is required');
      }
      const response = await api.post('/interviews', data);
      const interview = response?.data?.interview;
      if (!interview) {
        throw new Error('Invalid response from server');
      }
      return interview;
    },
    onSuccess: (newInterview, variables) => {
      // Optimistically update cache instead of refetching
      if (variables.jobId) {
        queryClient.setQueryData<InterviewRound[]>(
          ['interviews', variables.jobId],
          (old = []) => [...old, newInterview]
        );
      }
      // Update the general interviews query (used by CalendarPage)
      queryClient.setQueryData<InterviewRound[]>(
        ['interviews'],
        (old = []) => [...old, newInterview]
      );
      toast.success('Interview scheduled successfully!', {
        description: variables.stage,
      });
    },
    onError: () => {
      toast.error('Failed to schedule interview', {
        description: 'Please try again.',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<InterviewRound>) => {
      if (!id) {
        throw new Error('Interview ID is required');
      }
      const response = await api.put(`/interviews/${id}`, data);
      const interview = response?.data?.interview;
      if (!interview) {
        throw new Error('Invalid response from server');
      }
      return interview;
    },
    onSuccess: (updatedInterview) => {
      // Invalidate queries to trigger refetch (only one refetch will happen due to React Query deduplication)
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      if (updatedInterview.jobId) {
        queryClient.invalidateQueries({ queryKey: ['interviews', updatedInterview.jobId] });
      }
      toast.success('Interview updated successfully!', {
        description: updatedInterview.stage,
      });
    },
    onError: () => {
      toast.error('Failed to update interview', {
        description: 'Please try again.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, jobId }: { id: string; jobId: string }) => {
      if (!id) {
        throw new Error('Interview ID is required');
      }
      if (!jobId) {
        throw new Error('Job ID is required');
      }
      await api.delete(`/interviews/${id}`);
    },
    onSuccess: (_, variables) => {
      // Optimistically update cache instead of refetching
      if (variables.jobId) {
        queryClient.setQueryData<InterviewRound[]>(
          ['interviews', variables.jobId],
          (old = []) => old.filter((interview) => interview._id !== variables.id)
        );
      }
      // Update the general interviews query (used by CalendarPage)
      queryClient.setQueryData<InterviewRound[]>(
        ['interviews'],
        (old = []) => old.filter((interview) => interview._id !== variables.id)
      );
      toast.success('Interview deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete interview', {
        description: 'Please try again.',
      });
    },
  });

  return {
    createInterview: createMutation.mutate,
    createInterviewAsync: createMutation.mutateAsync,
    updateInterview: updateMutation.mutate,
    updateInterviewAsync: updateMutation.mutateAsync,
    deleteInterview: deleteMutation.mutate,
    deleteInterviewAsync: deleteMutation.mutateAsync,
  };
};

