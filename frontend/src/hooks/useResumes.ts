import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../lib/api';
import { ResumeVersion } from '../types';

export const useResumes = () => {
  const queryClient = useQueryClient();

  const { data: resumes = [], isLoading } = useQuery<ResumeVersion[]>({
    queryKey: ['resumes'],
    queryFn: async () => {
      try {
        const response = await api.get('/resumes');
        return response?.data?.resumes ?? [];
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message ?? error?.message ?? 'Failed to fetch resumes';
        toast.error('Error loading resumes', {
          description: errorMessage,
        });
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

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
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
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
    uploadResume: uploadMutation.mutate,
    deleteResume: deleteMutation.mutate,
  };
};

