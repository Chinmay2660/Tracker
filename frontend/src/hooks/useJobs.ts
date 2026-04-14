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
                const normalizedJobs = Array.isArray(jobsData) ? jobsData.map((job: any) => ({
                    ...job,
                    columnId: typeof job?.columnId === 'object' && job?.columnId?._id
                        ? job.columnId._id
                        : job?.columnId,
                })) : [];
                return normalizedJobs;
            }
            catch (error: any) {
                const errorMessage = error?.response?.data?.message ?? error?.message ?? 'Failed to fetch jobs';
                toast.error('Error loading jobs', {
                    description: errorMessage,
                });
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
    useEffect(() => {
        if (jobs.length > 0 || !isLoading) {
            setJobs(jobs);
        }
    }, [jobs, setJobs, isLoading]);
    const createMutation = useMutation({
        mutationFn: async (data: Partial<Job>) => {
            const response = await api.post('/jobs', data);
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
            return {
                ...job,
                columnId: typeof job?.columnId === 'object' && job?.columnId?._id
                    ? job.columnId._id
                    : job?.columnId,
            };
        },
        onSuccess: (updatedJob) => {
            queryClient.setQueryData<Job[]>(['jobs'], (old = []) => old.map((job) => (job._id === updatedJob._id ? updatedJob : job)));
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
            queryClient.setQueryData<Job[]>(['jobs'], (old = []) => old.filter((job) => job._id !== deletedId));
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
            return {
                ...job,
                columnId: typeof job?.columnId === 'object' && job?.columnId?._id
                    ? job.columnId._id
                    : job?.columnId,
            };
        },
        onMutate: async ({ id, columnId }) => {
            await queryClient.cancelQueries({ queryKey: ['jobs'] });
            const previousJobs = queryClient.getQueryData<Job[]>(['jobs']);
            queryClient.setQueryData<Job[]>(['jobs'], (old = []) => old.map((job) => job._id === id ? { ...job, columnId } : job));
            return { previousJobs };
        },
        onError: (err, variables, context) => {
            if (context?.previousJobs) {
                queryClient.setQueryData<Job[]>(['jobs'], context.previousJobs);
            }
            toast.error('Failed to move job', {
                description: 'Please try again.',
            });
        },
        onSuccess: (updatedJob) => {
            queryClient.setQueryData<Job[]>(['jobs'], (old = []) => old.map((job) => (job._id === updatedJob._id ? updatedJob : job)));
        },
        onSettled: () => {
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
            await queryClient.cancelQueries({ queryKey: ['jobs'] });
            const previousJobs = queryClient.getQueryData<Job[]>(['jobs']);
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
            if (context?.previousJobs) {
                queryClient.setQueryData<Job[]>(['jobs'], context.previousJobs);
            }
            toast.error('Failed to reorder jobs', {
                description: 'Please try again.',
            });
        },
        onSettled: () => {
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
