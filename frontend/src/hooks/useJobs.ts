import { queryOptions, useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../lib/api';
import { QUERY_CACHE_OPTIONS } from '../lib/queryCache';
import { Job, InterviewRound } from '../types';
import { ALL_INTERVIEWS_QUERY_KEY } from './useAllInterviews';

export const JOBS_QUERY_KEY = ['jobs'] as const;

export function normalizeJob(job: Record<string, unknown>): Job {
    return {
        ...job,
        columnId: typeof job?.columnId === 'object' && job?.columnId !== null && '_id' in (job.columnId as object)
            ? (job.columnId as { _id: string })._id
            : (job?.columnId as string),
    } as Job;
}

async function fetchJobs(): Promise<Job[]> {
    const response = await api.get('/jobs');
    const jobsData = response?.data?.jobs ?? [];
    return Array.isArray(jobsData) ? jobsData.map((job) => normalizeJob(job)) : [];
}

export const jobsQueryOptions = queryOptions({
    queryKey: JOBS_QUERY_KEY,
    queryFn: async () => {
        try {
            return await fetchJobs();
        }
        catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch jobs';
            toast.error('Error loading jobs', { description: errorMessage });
            throw error;
        }
    },
    ...QUERY_CACHE_OPTIONS,
});

function removeInterviewsForJob(queryClient: QueryClient, jobId: string): void {
    queryClient.setQueryData<InterviewRound[]>(ALL_INTERVIEWS_QUERY_KEY, (old = []) =>
        old.filter((interview) => interview.jobId !== jobId),
    );
    queryClient.removeQueries({ queryKey: ['interviews', jobId] });
}

export const useJobs = () => {
    const queryClient = useQueryClient();
    const { data: jobs = [], isLoading } = useQuery(jobsQueryOptions);
    const createMutation = useMutation({
        mutationFn: async (data: Partial<Job>) => {
            const response = await api.post('/jobs', data);
            const job = response?.data?.job;
            if (!job) {
                throw new Error('Invalid response from server');
            }
            return normalizeJob(job);
        },
        onSuccess: (newJob) => {
            queryClient.setQueryData<Job[]>(JOBS_QUERY_KEY, (old = []) => [...old, newJob]);
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
        mutationFn: async ({ id, ...data }: {
            id: string;
        } & Partial<Job>) => {
            if (!id) {
                throw new Error('Job ID is required');
            }
            const response = await api.put(`/jobs/${id}`, data);
            const job = response?.data?.job;
            if (!job) {
                throw new Error('Invalid response from server');
            }
            return normalizeJob(job);
        },
        onSuccess: (updatedJob) => {
            queryClient.setQueryData<Job[]>(JOBS_QUERY_KEY, (old = []) =>
                old.map((job) => (job._id === updatedJob._id ? updatedJob : job)),
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
            queryClient.setQueryData<Job[]>(JOBS_QUERY_KEY, (old = []) => old.filter((job) => job._id !== deletedId));
            removeInterviewsForJob(queryClient, deletedId);
            toast.success('Job deleted successfully!');
        },
        onError: () => {
            toast.error('Failed to delete job', {
                description: 'Please try again.',
            });
        },
    });
    const moveMutation = useMutation({
        mutationFn: async ({ id, columnId }: {
            id: string;
            columnId: string;
        }) => {
            if (!id || !columnId) {
                throw new Error('Job ID and Column ID are required');
            }
            const response = await api.patch(`/jobs/${id}/move`, { columnId });
            const job = response?.data?.job;
            if (!job) {
                throw new Error('Invalid response from server');
            }
            return normalizeJob(job);
        },
        onMutate: async ({ id, columnId }) => {
            await queryClient.cancelQueries({ queryKey: JOBS_QUERY_KEY });
            const previousJobs = queryClient.getQueryData<Job[]>(JOBS_QUERY_KEY);
            queryClient.setQueryData<Job[]>(JOBS_QUERY_KEY, (old = []) =>
                old.map((job) => job._id === id ? { ...job, columnId } : job),
            );
            return { previousJobs };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousJobs) {
                queryClient.setQueryData<Job[]>(JOBS_QUERY_KEY, context.previousJobs);
            }
            toast.error('Failed to move job', {
                description: 'Please try again.',
            });
        },
        onSuccess: (updatedJob) => {
            queryClient.setQueryData<Job[]>(JOBS_QUERY_KEY, (old = []) =>
                old.map((job) => (job._id === updatedJob._id ? updatedJob : job)),
            );
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
            await queryClient.cancelQueries({ queryKey: JOBS_QUERY_KEY });
            const previousJobs = queryClient.getQueryData<Job[]>(JOBS_QUERY_KEY);
            queryClient.setQueryData<Job[]>(JOBS_QUERY_KEY, (old = []) => {
                const jobMap = new Map(old.map(job => [job._id, job]));
                return jobIds.map((id, index) => {
                    const job = jobMap.get(id);
                    return job ? { ...job, order: index } : job;
                }).filter(Boolean) as Job[];
            });
            return { previousJobs };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousJobs) {
                queryClient.setQueryData<Job[]>(JOBS_QUERY_KEY, context.previousJobs);
            }
            toast.error('Failed to reorder jobs', {
                description: 'Please try again.',
            });
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
