import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '../lib/api';
import { Column } from '../types';
import { useBoardStore } from '../store/useBoardStore';

export const useColumns = () => {
  const queryClient = useQueryClient();
  const { setColumns } = useBoardStore();

  const { data: columns = [], isLoading } = useQuery<Column[]>({
    queryKey: ['columns'],
    queryFn: async () => {
      const response = await api.get('/columns');
      return response.data.columns;
    },
  });

  useEffect(() => {
    if (columns.length > 0 || !isLoading) {
      setColumns(columns);
    }
  }, [columns, setColumns, isLoading]);

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; order?: number }) => {
      const response = await api.post('/columns', data);
      return response.data.column;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; order?: number }) => {
      const response = await api.put(`/columns/${id}`, data);
      return response.data.column;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/columns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  return {
    columns,
    isLoading,
    createColumn: createMutation.mutate,
    updateColumn: updateMutation.mutate,
    deleteColumn: deleteMutation.mutate,
  };
};

