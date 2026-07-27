import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { columnsQueryOptions } from './useColumns';
import { jobsQueryOptions } from './useJobs';
import { resumesQueryOptions } from './useResumes';

export const usePrefetchDashboard = () => {
    const queryClient = useQueryClient();
    const { token } = useAuthStore();
    useEffect(() => {
        if (!token) {
            return;
        }
        const columnsState = queryClient.getQueryState(columnsQueryOptions.queryKey);
        if (columnsState?.fetchStatus !== 'fetching' && columnsState?.data === undefined) {
            void queryClient.prefetchQuery(columnsQueryOptions);
        }
        const jobsState = queryClient.getQueryState(jobsQueryOptions.queryKey);
        if (jobsState?.fetchStatus !== 'fetching' && jobsState?.data === undefined) {
            void queryClient.prefetchQuery(jobsQueryOptions);
        }
        const resumesState = queryClient.getQueryState(resumesQueryOptions.queryKey);
        if (resumesState?.fetchStatus !== 'fetching' && resumesState?.data === undefined) {
            void queryClient.prefetchQuery(resumesQueryOptions);
        }
    }, [token, queryClient]);
};
