import { queryOptions, useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../lib/api';
import { QUERY_CACHE_OPTIONS } from '../lib/queryCache';
import { InterviewRound } from '../types';
import { ALL_INTERVIEWS_QUERY_KEY } from './useAllInterviews';

function patchInterviewCaches(
    queryClient: QueryClient,
    jobId: string | undefined,
    patch: (list: InterviewRound[]) => InterviewRound[],
): void {
    queryClient.setQueryData<InterviewRound[]>(ALL_INTERVIEWS_QUERY_KEY, (old = []) => patch(old));
    if (jobId) {
        queryClient.setQueryData<InterviewRound[]>(['interviews', jobId], (old = []) => patch(old));
    }
}

export function jobInterviewsQueryOptions(jobId: string) {
    return queryOptions({
        queryKey: ['interviews', jobId],
        queryFn: async () => {
            if (!jobId) {
                return [];
            }
            try {
                const response = await api.get(`/interviews/jobs/${jobId}`);
                return response?.data?.interviews ?? [];
            }
            catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } }; message?: string };
                const errorMessage = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch interviews';
                toast.error('Error loading interviews', { description: errorMessage });
                return [];
            }
        },
        enabled: !!jobId,
        ...QUERY_CACHE_OPTIONS,
    });
}

export const useJobInterviews = (jobId: string) => useQuery(jobInterviewsQueryOptions(jobId));

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
        onSuccess: (interview, variables) => {
            patchInterviewCaches(queryClient, interview.jobId ?? variables.jobId, (old) => [...old, interview]);
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
        mutationFn: async ({ id, ...data }: {
            id: string;
        } & Partial<InterviewRound>) => {
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
            patchInterviewCaches(queryClient, updatedInterview.jobId, (old) =>
                old.map((interview) => (interview._id === updatedInterview._id ? updatedInterview : interview)),
            );
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
        mutationFn: async ({ id, jobId }: {
            id: string;
            jobId: string;
        }) => {
            if (!id) {
                throw new Error('Interview ID is required');
            }
            if (!jobId) {
                throw new Error('Job ID is required');
            }
            await api.delete(`/interviews/${id}`);
        },
        onSuccess: (_, { id, jobId }) => {
            patchInterviewCaches(queryClient, jobId, (old) => old.filter((interview) => interview._id !== id));
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
