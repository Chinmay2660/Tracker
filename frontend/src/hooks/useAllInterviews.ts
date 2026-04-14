import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { InterviewRound, Job } from '../types';
export const useAllInterviews = (jobs: Job[]) => {
    return useQuery<InterviewRound[]>({
        queryKey: ['interviews', 'all', jobs.map(j => j._id).join(',')],
        queryFn: async () => {
            if (!Array.isArray(jobs) || jobs.length === 0) {
                return [];
            }
            const interviewPromises = jobs
                .filter(job => job?._id)
                .map(job => api.get(`/interviews/jobs/${job._id}`)
                .then(response => response?.data?.interviews ?? [])
                .catch(error => {
                if (error?.response?.status !== 404) {
                    console.warn(`Failed to fetch interviews for job ${job._id}`);
                }
                return [];
            }));
            const results = await Promise.all(interviewPromises);
            return results.flat().filter(Boolean);
        },
        enabled: jobs.length > 0,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
};
