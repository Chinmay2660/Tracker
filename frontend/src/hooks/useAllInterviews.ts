import { queryOptions, useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { QUERY_CACHE_OPTIONS } from '../lib/queryCache';
import { InterviewRound } from '../types';

export const ALL_INTERVIEWS_QUERY_KEY = ['interviews', 'all'] as const;

async function fetchAllInterviews(): Promise<InterviewRound[]> {
    const response = await api.get('/interviews');
    return response.data?.interviews ?? [];
}

export const allInterviewsQueryOptions = queryOptions({
    queryKey: ALL_INTERVIEWS_QUERY_KEY,
    queryFn: fetchAllInterviews,
    ...QUERY_CACHE_OPTIONS,
    retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status !== undefined && status >= 400 && status < 500) {
            return false;
        }
        return failureCount < 1;
    },
});

export const useAllInterviews = () => useQuery(allInterviewsQueryOptions);
