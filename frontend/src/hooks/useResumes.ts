import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { ResumeVersion } from '../types';

export const useResumes = () => {
  const queryClient = useQueryClient();

  const { data: resumes = [], isLoading } = useQuery<ResumeVersion[]>({
    queryKey: ['resumes'],
    queryFn: async () => {
      const response = await api.get('/resumes');
      return response.data.resumes;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      const response = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.resume;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/resumes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });

  return {
    resumes,
    isLoading,
    uploadResume: uploadMutation.mutate,
    deleteResume: deleteMutation.mutate,
  };
};

