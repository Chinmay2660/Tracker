import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { allInterviewsQueryOptions } from './useAllInterviews';
import { columnsQueryOptions } from './useColumns';
import { jobsQueryOptions } from './useJobs';
import { resumesQueryOptions } from './useResumes';

export const usePrefetchDashboard = () => {
    const queryClient = useQueryClient();
    const { token } = useAuthStore();
    useEffect(() => {
        if (!token)
            return;
        void Promise.allSettled([
            queryClient.prefetchQuery(columnsQueryOptions),
            queryClient.prefetchQuery(jobsQueryOptions),
            queryClient.prefetchQuery(resumesQueryOptions),
            queryClient.prefetchQuery(allInterviewsQueryOptions),
        ]);
    }, [token, queryClient]);
};
