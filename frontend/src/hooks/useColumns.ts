import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../lib/api';
import { QUERY_CACHE_OPTIONS } from '../lib/queryCache';
import { Column } from '../types';

export const COLUMNS_QUERY_KEY = ['columns'] as const;

async function fetchColumns(): Promise<Column[]> {
    const response = await api.get('/columns');
    return response.data?.columns ?? [];
}

export const columnsQueryOptions = queryOptions({
    queryKey: COLUMNS_QUERY_KEY,
    queryFn: fetchColumns,
    ...QUERY_CACHE_OPTIONS,
});

export const useColumns = () => {
    const queryClient = useQueryClient();
    const { data: columns = [], isLoading } = useQuery(columnsQueryOptions);
    const createMutation = useMutation({
        mutationFn: async (data: {
            title: string;
            order?: number;
            color?: string;
            silent?: boolean;
        }) => {
            if (!data?.title?.trim()) {
                throw new Error('Stage title is required');
            }
            const { silent, ...apiData } = data;
            const response = await api.post('/columns', apiData);
            const column = response?.data?.column;
            if (!column) {
                throw new Error('Invalid response from server');
            }
            return { column, silent };
        },
        onSuccess: ({ column: newColumn, silent }) => {
            queryClient.setQueryData<Column[]>(COLUMNS_QUERY_KEY, (old = []) => [...old, newColumn]);
            if (!silent) {
                toast.success('Stage added successfully!', {
                    description: newColumn.title,
                });
            }
        },
        onError: (_, variables) => {
            if (!variables.silent) {
                toast.error('Failed to add stage', {
                    description: 'Please try again.',
                });
            }
        },
    });
    const updateMutation = useMutation({
        mutationFn: async ({ id, ...data }: {
            id: string;
            title?: string;
            order?: number;
            color?: string;
        }) => {
            if (!id) {
                throw new Error('Stage ID is required');
            }
            const response = await api.put(`/columns/${id}`, data);
            const column = response?.data?.column;
            if (!column) {
                throw new Error('Invalid response from server');
            }
            return column;
        },
        onSuccess: (updatedColumn) => {
            queryClient.setQueryData<Column[]>(COLUMNS_QUERY_KEY, (old = []) =>
                old.map((col) => (col._id === updatedColumn._id ? updatedColumn : col)),
            );
            toast.success('Stage updated successfully!', {
                description: updatedColumn.title,
            });
        },
        onError: () => {
            toast.error('Failed to update stage', {
                description: 'Please try again.',
            });
        },
    });
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            if (!id) {
                throw new Error('Stage ID is required');
            }
            await api.delete(`/columns/${id}`);
        },
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<Column[]>(COLUMNS_QUERY_KEY, (old = []) =>
                old.filter((col) => col._id !== deletedId),
            );
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            toast.success('Stage deleted successfully!');
        },
        onError: () => {
            toast.error('Failed to delete stage', {
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
