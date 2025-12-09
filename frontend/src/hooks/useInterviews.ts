import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { InterviewRound } from '../types';

export const useJobInterviews = (jobId: string) => {
  return useQuery<InterviewRound[]>({
    queryKey: ['interviews', jobId],
    queryFn: async () => {
      const response = await api.get(`/interviews/jobs/${jobId}`);
      return response.data.interviews;
    },
    enabled: !!jobId,
  });
};

export const useInterviews = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InterviewRound>) => {
      const response = await api.post('/interviews', data);
      return response.data.interview;
    },
    onSuccess: (_, variables) => {
      if (variables.jobId) {
        queryClient.invalidateQueries({ queryKey: ['interviews', variables.jobId] });
      }
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<InterviewRound>) => {
      const response = await api.put(`/interviews/${id}`, data);
      return response.data.interview;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', data.jobId] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, jobId }: { id: string; jobId: string }) => {
      await api.delete(`/interviews/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });

  return {
    createInterview: createMutation.mutate,
    updateInterview: updateMutation.mutate,
    deleteInterview: deleteMutation.mutate,
  };
};

