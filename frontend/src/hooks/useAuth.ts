import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { User } from '../types';

export const useAuth = () => {
  const { setUser, token } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me');
        return response?.data?.user;
      } catch (error: any) {
        // Don't show toast for 401 errors as they're handled by interceptor
        if (error?.response?.status !== 401) {
          const errorMessage = error?.response?.data?.message ?? error?.message ?? 'Failed to fetch user';
          toast.error('Error loading user', {
            description: errorMessage,
          });
        }
        throw error;
      }
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/google`;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await api.post('/auth/logout');
      } catch (error: any) {
        // Even if logout API fails, clear local state
        const errorMessage = error?.response?.data?.message ?? error?.message;
        if (errorMessage) {
          toast.error('Logout error', {
            description: errorMessage,
          });
        }
      }
    },
    onSuccess: () => {
      // Clear auth store first
      useAuthStore.getState().logout();
      // Clear all query cache
      queryClient.clear();
      // Redirect to home page (landing page) - use replace to prevent back button issues
      navigate('/', { replace: true });
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
  };
};

