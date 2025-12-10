import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import api from '../lib/api';
import { Column } from '../types';
import { useBoardStore } from '../store/useBoardStore';

export const useColumns = () => {
  const queryClient = useQueryClient();
  const { setColumns } = useBoardStore();

  const { data: columns = [], isLoading } = useQuery<Column[]>({
    queryKey: ['columns'],
    queryFn: async () => {
      try {
        const response = await api.get('/columns');
        return response?.data?.columns ?? [];
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message ?? error?.message ?? 'Failed to fetch columns';
        toast.error('Error loading columns', {
          description: errorMessage,
        });
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes (allows React Query to deduplicate)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists (React Query will deduplicate)
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  useEffect(() => {
    if (columns.length > 0 || !isLoading) {
      setColumns(columns);
    }
  }, [columns, setColumns, isLoading]);

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; order?: number }) => {
      if (!data?.title?.trim()) {
        throw new Error('Column title is required');
      }
      const response = await api.post('/columns', data);
      const column = response?.data?.column;
      if (!column) {
        throw new Error('Invalid response from server');
      }
      return column;
    },
    onSuccess: (newColumn) => {
      // Optimistically update cache instead of refetching
      queryClient.setQueryData<Column[]>(['columns'], (old = []) => [...old, newColumn]);
      toast.success('Column added successfully!', {
        description: newColumn.title,
      });
    },
    onError: () => {
      toast.error('Failed to add column', {
        description: 'Please try again.',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; order?: number }) => {
      if (!id) {
        throw new Error('Column ID is required');
      }
      const response = await api.put(`/columns/${id}`, data);
      const column = response?.data?.column;
      if (!column) {
        throw new Error('Invalid response from server');
      }
      return column;
    },
    onSuccess: (updatedColumn) => {
      // Optimistically update cache instead of refetching
      queryClient.setQueryData<Column[]>(['columns'], (old = []) =>
        old.map((col) => (col._id === updatedColumn._id ? updatedColumn : col))
      );
      toast.success('Column updated successfully!', {
        description: updatedColumn.title,
      });
    },
    onError: () => {
      toast.error('Failed to update column', {
        description: 'Please try again.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error('Column ID is required');
      }
      await api.delete(`/columns/${id}`);
    },
    onSuccess: (_, deletedId) => {
      // Optimistically update cache instead of refetching
      queryClient.setQueryData<Column[]>(['columns'], (old = []) =>
        old.filter((col) => col._id !== deletedId)
      );
      // Invalidate jobs since deleting a column affects jobs
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Column deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete column', {
        description: 'Please try again.',
      });
    },
  });

  return {
    columns,
    isLoading,
    createColumn: createMutation.mutate,
    updateColumn: updateMutation.mutate,
    deleteColumn: deleteMutation.mutate,
    deleteColumnAsync: deleteMutation.mutateAsync,
  };
};

