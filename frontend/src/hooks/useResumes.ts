import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../lib/api';
import { QUERY_CACHE_OPTIONS } from '../lib/queryCache';
import { ResumeVersion } from '../types';

export const RESUMES_QUERY_KEY = ['resumes'] as const;

async function fetchResumes(): Promise<ResumeVersion[]> {
    try {
        const response = await api.get('/resumes');
        return response?.data?.resumes ?? [];
    }
    catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        const errorMessage = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch resumes';
        toast.error('Error loading resumes', { description: errorMessage });
        return [];
    }
}

export const resumesQueryOptions = queryOptions({
    queryKey: RESUMES_QUERY_KEY,
    queryFn: fetchResumes,
    ...QUERY_CACHE_OPTIONS,
});

export const useResumes = () => {
    const queryClient = useQueryClient();
    const { data: resumes = [], isLoading } = useQuery(resumesQueryOptions);
    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            if (!file) {
                throw new Error('File is required');
            }
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', file.name ?? 'Untitled');
            const response = await api.post('/resumes/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const resume = response?.data?.resume;
            if (!resume) {
                throw new Error('Invalid response from server');
            }
            return resume;
        },
        onSuccess: (resume) => {
            queryClient.setQueryData<ResumeVersion[]>(RESUMES_QUERY_KEY, (old = []) => [...old, resume]);
            toast.success('Resume uploaded successfully!', {
                description: resume.name,
            });
        },
        onError: () => {
            toast.error('Failed to upload resume', {
                description: 'Please try again.',
            });
        },
    });
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            if (!id) {
                throw new Error('Resume ID is required');
            }
            await api.delete(`/resumes/${id}`);
        },
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<ResumeVersion[]>(RESUMES_QUERY_KEY, (old = []) =>
                old.filter((resume) => resume._id !== deletedId),
            );
            toast.success('Resume deleted successfully!');
        },
        onError: () => {
            toast.error('Failed to delete resume', {
                description: 'Please try again.',
            });
        },
    });
    return {
        resumes,
        isLoading,
        isUploading: uploadMutation.isPending,
        uploadResume: uploadMutation.mutate,
        uploadResumeAsync: uploadMutation.mutateAsync,
        deleteResume: deleteMutation.mutate,
    };
};
