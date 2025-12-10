import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { InterviewRound, Job } from '../types';

/**
 * Fetches all interviews for all jobs in parallel.
 * This is more efficient than fetching interviews for each job sequentially.
 * 
 * @param jobs - Array of jobs to fetch interviews for
 * @returns All interviews across all jobs
 */
export const useAllInterviews = (jobs: Job[]) => {
  return useQuery<InterviewRound[]>({
    queryKey: ['interviews', 'all', jobs.map(j => j._id).join(',')],
    queryFn: async () => {
      if (!Array.isArray(jobs) || jobs.length === 0) {
        return [];
      }
      
      // Fetch all interviews in PARALLEL using Promise.all
      const interviewPromises = jobs
        .filter(job => job?._id)
        .map(job => 
          api.get(`/interviews/jobs/${job._id}`)
            .then(response => response?.data?.interviews ?? [])
            .catch(error => {
              // Skip 404 errors silently, return empty array
              if (error?.response?.status !== 404) {
                console.warn(`Failed to fetch interviews for job ${job._id}`);
              }
              return [];
            })
        );
      
      const results = await Promise.all(interviewPromises);
      
      // Flatten all interview arrays into one
      return results.flat().filter(Boolean);
    },
    enabled: jobs.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

